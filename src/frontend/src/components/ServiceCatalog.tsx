import { ChevronRight, Search } from "lucide-react";
import React, { useState, useMemo } from "react";
import { SERVICES } from "../data/services";

interface ServiceCatalogProps {
  onSelectService: (serviceName: string) => void;
}

export default function ServiceCatalog({
  onSelectService,
}: ServiceCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return SERVICES;
    const q = searchQuery.toLowerCase();
    return SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const _categories = useMemo(() => {
    const cats = new Set(filteredServices.map((s) => s.category));
    return Array.from(cats);
  }, [filteredServices]);

  return (
    <div
      className="min-h-full page-enter"
      style={{ background: "oklch(0.14 0.04 240)" }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 pt-6 pb-4"
        style={{
          background: "oklch(0.14 0.04 240)",
          borderBottom: "1px solid oklch(0.22 0.06 240)",
        }}
      >
        <h1
          className="text-xl font-bold mb-1"
          style={{ color: "oklch(0.97 0.005 240)" }}
        >
          Our Services
        </h1>
        <p
          className="text-xs mb-4 font-devanagari"
          style={{ color: "oklch(0.62 0.015 240)" }}
        >
          हमारी सेवाएं — {SERVICES.length} services available
        </p>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "oklch(0.62 0.015 240)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "oklch(0.22 0.06 240)",
              border: "1px solid oklch(0.35 0.08 240)",
              color: "oklch(0.97 0.005 240)",
            }}
          />
        </div>
      </div>

      {/* Services List */}
      <div className="px-4 py-4 pb-24">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p
              className="font-medium"
              style={{ color: "oklch(0.62 0.015 240)" }}
            >
              No services found
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.45 0.02 240)" }}
            >
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredServices.map((service, index) => (
              <button
                type="button"
                key={service.id}
                onClick={() => onSelectService(service.name)}
                className="w-full service-card p-4 flex items-center gap-3 text-left"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: "oklch(0.22 0.06 240)" }}
                >
                  {service.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "oklch(0.97 0.005 240)" }}
                  >
                    {service.name}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.62 0.015 240)" }}
                  >
                    {service.description} · {service.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "oklch(0.22 0.06 240)",
                      color: "oklch(0.72 0.015 240)",
                    }}
                  >
                    #{service.id}
                  </span>
                  <ChevronRight
                    size={16}
                    style={{ color: "oklch(0.45 0.02 240)" }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
