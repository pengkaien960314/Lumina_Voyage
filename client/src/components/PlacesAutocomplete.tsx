import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PlacesAutocomplete({ value, onChange, placeholder, className }: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (window.google?.maps?.places) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
  }, []);

  // 點擊外部關閉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback((input: string) => {
    if (!serviceRef.current || !input.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    serviceRef.current.getPlacePredictions(
      { input, types: ["establishment", "geocode"] },
      (predictions, status) => {
        setLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const handleInputChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    onChange(prediction.structured_formatting.main_text);
    setShowDropdown(false);
    setSuggestions([]);
  };

  // 如果 Google Maps 沒載入，降級為普通 Input
  if (!window.google?.maps?.places) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || "輸入地點..."}
          className={`pl-9 ${className || ""}`}
        />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground z-10" />}
      <Input
        value={value}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder || "輸入地點..."}
        className={`pl-9 ${className || ""}`}
      />
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.place_id}
              className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-2 text-sm"
              onClick={() => handleSelect(s)}
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{s.structured_formatting.main_text}</p>
                <p className="text-xs text-muted-foreground">{s.structured_formatting.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
