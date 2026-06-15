"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressPickerProps {
  onAddressSelect: (address: string) => void;
  label?: string;
  placeholder?: string;
}

const TBILISI_ADDRESSES = [
  "Rustaveli Avenue, Tbilisi",
  "Kostava Street, Tbilisi",
  "Agmashenebeli Avenue, Tbilisi",
  "Chavchavadze Avenue, Tbilisi",
  "Pekin Street, Tbilisi",
  "Tsereteli Avenue, Tbilisi",
  "Saburtalo, Tbilisi",
  "Vake, Tbilisi",
  "Isani, Tbilisi",
  "Didube, Tbilisi",
  "Gldani, Tbilisi",
  "Nadzaladevi, Tbilisi",
  "Ponichala, Tbilisi",
  "Didi Dighomi, Tbilisi",
  "University Campus, Tbilisi State University",
  "Free University, Tbilisi",
  "GTU Campus, Georgian Technical University",
  "Caucasus University, Tbilisi",
  "IBSU, International Black Sea University, Tbilisi",
];

export function AddressPicker({
  onAddressSelect,
  label = "Delivery Address",
  placeholder = "Enter delivery address...",
}: AddressPickerProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    setSelected(false);

    if (val.length > 1) {
      const filtered = TBILISI_ADDRESSES.filter((addr) =>
        addr.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    onAddressSelect(val);
  };

  const handleSelect = (address: string) => {
    setValue(address);
    setSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    onAddressSelect(address);
  };

  const handleClear = () => {
    setValue("");
    setSelected(false);
    setSuggestions([]);
    setShowSuggestions(false);
    onAddressSelect("");
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-background transition-all",
            showSuggestions || selected
              ? "border-primary-500 ring-2 ring-primary-500/20"
              : "border-border hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
          )}
        >
          <MapPin className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            selected ? "text-primary-500" : "text-muted-foreground"
          )} />
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!value && (
            <Search className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <ul className="py-1 max-h-52 overflow-y-auto">
              {suggestions.map((addr, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelect(addr)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-500 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                    <span>{addr}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selected && (
        <p className="text-xs text-accent-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Address confirmed
        </p>
      )}
    </div>
  );
}
