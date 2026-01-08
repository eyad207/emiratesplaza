"use client";
import useBrowsingHistory from "@/hooks/use-browsing-history";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import ProductSlider from "./product/product-slider";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "../ui/card";

// Cache for browsing history API responses
const apiCache = new Map<string, { data: unknown[]; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

export default function BrowsingHistoryList({}: { className?: string }) {
  const { products = [] } = useBrowsingHistory();
  const t = useTranslations("Home");
  const [historyData, setHistoryData] = useState<unknown[]>([]);
  const [relatedData, setRelatedData] = useState<unknown[]>([]);

  // Memoize the product IDs and categories to prevent unnecessary re-fetches
  const productIds = useMemo(
    () => products.map((p) => p.id).join(","),
    [products]
  );
  const categories = useMemo(
    () => products.map((p) => p.category).join(","),
    [products]
  );

  // Single optimized fetch for both history and related products
  const fetchBrowsingData = useCallback(async () => {
    if (!productIds) return;

    const cacheKey = `${productIds}-${categories}`;
    const cached = apiCache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Fetch both types in parallel instead of sequentially
      const [historyRes, relatedRes] = await Promise.all([
        fetch(
          `/api/products/browsing-history?type=history&excludeId=&categories=${categories}&ids=${productIds}`
        ),
        fetch(
          `/api/products/browsing-history?type=related&excludeId=&categories=${categories}&ids=${productIds}`
        ),
      ]);

      const [historyJson, relatedJson] = await Promise.all([
        historyRes.json(),
        relatedRes.json(),
      ]);

      setHistoryData(historyJson || []);
      setRelatedData(relatedJson || []);

      // Cache the results
      apiCache.set(cacheKey, {
        data: [...historyJson, ...relatedJson],
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch browsing history:", error);
    }
  }, [productIds, categories]);

  useEffect(() => {
    if (products.length > 0) {
      fetchBrowsingData();
    }
  }, [products.length, fetchBrowsingData]);

  // Don't render anything if no browsing history
  if (products.length === 0) return null;

  return (
    <div className="mt-3 sm:mt-5 md:mt-10">
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="space-y-6 md:space-y-10">
            {relatedData.length > 0 && (
              <ProductSlider
                title={t("Related to items that you've viewed")}
                products={
                  relatedData as Parameters<typeof ProductSlider>[0]["products"]
                }
              />
            )}

            {historyData.length > 0 && (
              <div className="border-t border-border/50 dark:border-zinc-700 pt-4 mt-4">
                <ProductSlider
                  title={t("Your browsing history")}
                  products={
                    historyData as Parameters<
                      typeof ProductSlider
                    >[0]["products"]
                  }
                  hideDetails
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
