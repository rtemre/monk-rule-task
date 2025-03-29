"use client";
import React, { useState } from "react";
import Select from "react-select";

// ✅ Define the types for rules and options
interface Rule {
  type: string;
  operator: string;
  value: string;
}

interface Option {
  label: string;
  value: string;
}

interface RuleConfig {
  label: string;
  value: string;
  mutuallyExclusive?: string[];
  operators: string[];
}

const RULES: RuleConfig[] = [
  {
    label: "Specific Collection",
    value: "specific_collection",
    mutuallyExclusive: ["specific_product"],
    operators: ["contains any", "is not"],
  },
  {
    label: "Product Tags",
    value: "product_tags",
    operators: ["contains any", "is not"],
  },
  {
    label: "Specific Product",
    value: "specific_product",
    mutuallyExclusive: ["specific_collection"],
    operators: ["equals anything", "contains any", "is not"],
  },
  {
    label: "Product Subscribed",
    value: "product_subscribed",
    operators: ["Yes", "No"],
  },
  {
    label: "Specific Discount Codes",
    value: "specific_discount_codes",
    operators: [],
  },
  {
    label: "Cart Value Range",
    value: "cart_value_range",
    operators: ["is equal or greater than", "is between", "is less than"],
  },
];

const OfferEligibility: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);

  const addRule = () => {
    setRules([...rules, { type: "", operator: "", value: "" }]);
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    const updatedRules = [...rules];
    updatedRules[index][field] = value;

    // Enforce mutually exclusive rules
    if (field === "type") {
      const selectedRule = RULES.find((r) => r.value === value);
      if (selectedRule?.mutuallyExclusive) {
        updatedRules.forEach((rule, i) => {
          if (
            i !== index &&
            selectedRule.mutuallyExclusive?.includes(rule.type)
          ) {
            rule.operator = ""; // Reset conflicting rule
          }
        });
      }
    }

    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Offer Eligibility Rules</h2>

      {rules.map((rule, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 mb-3 p-3 bg-white rounded-lg shadow"
        >
          <Select
            options={RULES.map((r) => ({ label: r.label, value: r.value }))}
            value={RULES.find((r) => r.value === rule.type) || null}
            onChange={(selected: Option | null) =>
              updateRule(index, "type", selected?.value || "")
            }
            placeholder="Select Rule"
            className="flex-1"
          />

          <Select
            options={
              RULES.find((r) => r.value === rule.type)?.operators.map((op) => ({
                label: op,
                value: op,
              })) || []
            }
            value={
              rule.operator
                ? { label: rule.operator, value: rule.operator }
                : null
            }
            onChange={(selected: Option | null) =>
              updateRule(index, "operator", selected?.value || "")
            }
            placeholder="Select Operator"
            className="flex-1"
            isDisabled={!rule.type}
          />

          <input
            type="text"
            value={rule.value}
            onChange={(e) => updateRule(index, "value", e.target.value)}
            className="p-2 border rounded w-32"
            placeholder="Value"
            disabled={!rule.operator}
          />

          <button
            onClick={() => removeRule(index)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
          >
            ✖
          </button>
        </div>
      ))}

      <button
        onClick={addRule}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        + Add Rule
      </button>
    </div>
  );
};

export default function Home() {
  return (
    <div>
      <OfferEligibility />
    </div>
  );
}
