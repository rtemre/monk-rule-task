"use client";
import React, { useState } from "react";
import Select from "react-select";

// ✅ Define the types for rules and options
interface Rule {
  type: string;
  operator: string;
  value: string | Array<string>;
}

interface Option {
  label: string;
  value: string;
}

interface RuleConfig {
  label: string;
  value: string;
  mutuallyExclusive?: string[];
  type: string;
  operators?: string[];
  options?: string[];
  multiValued?: boolean;
}

// There might be some operators for which multiple values are required like `is between`
// Add entries for those operators in the below array
const rangeInputOperators = ["is between"];

const mutuallyExclusive = {
  "contains any": ["is not"],
  "is not": ["contains any"],
} as Record<string, any>;

const RULES: RuleConfig[] = [
  {
    label: "Specific Collection",
    value: "specific_collection",
    mutuallyExclusive: ["specific_product"],
    operators: ["contains any", "is not"],
    type: "select",
    options: ["shirt", "t-shirt", "shorts", "bags"],
    multiValued: true,
  },
  {
    label: "Product Tags",
    value: "product_tags",
    operators: ["contains any", "is not"],
    type: "select",
    options: ["black", "blue", "red", "green"],
    multiValued: true,
  },
  {
    label: "Specific Product",
    value: "specific_product",
    mutuallyExclusive: ["specific_collection"],
    operators: ["equals anything", "contains any", "is not"],
    type: "select",
    options: ["shirt", "t-shirt", "shorts", "bags"],
    multiValued: true,
  },
  {
    label: "Product Subscribed",
    value: "product_subscribed",
    operators: ["Yes", "No"],
    type: "boolean",
  },
  {
    label: "Specific Discount Codes",
    value: "specific_discount_codes",
    type: "input",
  },
  {
    label: "Cart Value Range",
    value: "cart_value_range",
    operators: ["is equal or greater than", "is between", "is less than"],
    type: "select",
  },
];

const OfferEligibility: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Adding rule with empty values, as we do not know the type, value and its operator
  const addRule = () => {
    setRules([...rules, { type: "", operator: "", value: "" }]);
    setError(null);
  };

  // Do not allow adding the same rule multiple times, as we are having AND operator between rule, so adding same
  // type of rule again will make it difficult and confusing to maintain
  const isRuleAlreadySelected = (value: string) => {
    return rules.some((rule) => rule.type === value);
  };

  const updateRule = (
    index: number,
    field: keyof Rule,
    value: string,
    valueIndex = 0,
    isMultiValued = false
  ) => {
    const updatedRules = [...rules];
    // On operator change, make the value to default
    if (field === "operator") {
      const selectedRule = RULES.find(
        (r) => r.value === updatedRules[index]["type"]
      );
      updatedRules[index]["value"] =
        rangeInputOperators.includes(value) || selectedRule?.multiValued
          ? []
          : "";
    }

    if (
      field === "value" &&
      rangeInputOperators.includes(updatedRules[index]["operator"])
    ) {
      const [startValue, endValue] = updatedRules[index][field];
      if (valueIndex && startValue >= value) {
        setError("Please select a correct value");
      } else if (!valueIndex && endValue <= value) {
        setError("Please select a correct value");
      } else {
        (updatedRules[index][field] as string[])[valueIndex] = value;
      }
    } else if (field === "value" && isMultiValued) {
      // updatedRules[index][field] = [] as Array<string>
      (updatedRules[index][field] as string[]).push(value);
    } else {
      updatedRules[index][field] = value;
    }

    // Enforce mutually exclusive rules
    if (field === "type") {
      const selectedRule = RULES.find((r) => r.value === value);
      // On changing type, clear the values for value and operator fields and make them default
      updatedRules[index]["value"] = selectedRule?.multiValued ? [] : "";
      updatedRules[index]["operator"] = "";

      // if (selectedRule?.mutuallyExclusive) {
      // updatedRules.forEach((rule, i) => {
      // if (
      // i !== index &&
      // selectedRule.mutuallyExclusive?.includes(rule.type)
      // ) {
      // rule.operator = ""; // Reset conflicting rule
      // }
      // });
      // }
    }

    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const getRuleInfo = (rule: Rule) => {
    return RULES.find((r) => r.value === rule.type);
  };

  // Remove selected value from the array
  const updateRuleValue = (index: number, value: string) => {
    const updatedRules = [...rules];
    rules[index]["value"] = (rules[index]["value"] as string[]).filter(
      (v) => v != value
    );
    setRules(updatedRules);
    setError(null);
  };

  // Not working as expected
  const isMutualExclusiveRuleSelected = (rule: Rule, operator: string) => {
    const ruleInfo = getRuleInfo(rule) as RuleConfig;
    let isExclusive = false;
    ruleInfo.mutuallyExclusive?.map((m) => {
      const exclusiveRule = rules.find((r) => r.type === m);

      if (exclusiveRule) {
        isExclusive =
          mutuallyExclusive[operator]?.includes[exclusiveRule.operator];
      }
    });

    return isExclusive;
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-2">Rules</h2>
      <p className="mb-3">
        The offer will be triggered based on the rules in this section
      </p>
      {rules.map((rule, index) => (
        <div key={index}>
          <div className="flex items-center space-x-4 mb-3 p-3 bg-white rounded-lg shadow">
            <Select
              options={RULES.map((r) => ({
                label: r.label,
                value: r.value,
                isDisabled: isRuleAlreadySelected(r.value),
              }))}
              value={RULES.find((r) => r.value === rule.type) || null}
              onChange={(selected: Option | null) =>
                updateRule(index, "type", selected?.value || "")
              }
              placeholder="Select Rule"
              className="flex-1"
            />

            {(getRuleInfo(rule)?.operators || !rule.type) && (
              <>
                <Select
                  options={
                    getRuleInfo(rule)?.operators?.map((op) => ({
                      label: op,
                      value: op,
                      isDisabled: isMutualExclusiveRuleSelected(rule, op),
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
              </>
            )}

            {rangeInputOperators.includes(rule.operator) ? (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rule.value[0] || ""}
                    onChange={(e) =>
                      updateRule(index, "value", e.target.value, 0)
                    }
                    className="p-2 border rounded w-32"
                    placeholder="Value"
                    disabled={!rule.operator}
                  />
                  <input
                    type="text"
                    value={rule.value[1] || ""}
                    onChange={(e) =>
                      updateRule(index, "value", e.target.value, 1)
                    }
                    className="p-2 border rounded w-32"
                    placeholder="Value"
                    disabled={!rule.operator}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            ) : (
              <>
                {getRuleInfo(rule)?.type === "select" ? (
                  <Select
                    options={
                      getRuleInfo(rule)?.options?.map((op) => ({
                        label: op,
                        value: op,
                      })) || []
                    }
                    value={[]}
                    onChange={(selected: Option | null) =>
                      updateRule(index, "value", selected?.value || "", 0, true)
                    }
                    placeholder="Value"
                    className="flex-1"
                  />
                ) : (
                  getRuleInfo(rule)?.type !== "boolean" && (
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) =>
                        updateRule(index, "value", e.target.value)
                      }
                      className="p-2 border rounded w-32 flex-1"
                      placeholder="Value"
                    />
                  )
                )}
              </>
            )}

            <button
              onClick={() => removeRule(index)}
              className="px-3 py-1 rounded cursor-pointer"
            >
              <svg
                className="h-4 w-4 bg-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6L18 18"
                ></path>
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-4 mb-3">
            {Array.isArray(rule.value) &&
              rule.value.map((v, i) => (
                <div
                  key={i}
                  className="rounded-full bg-slate-500 py-0.5 px-2.5 text-sm text-white inline-flex items-center"
                >
                  <span className="px-2">{v}</span>
                  <span
                    className="badge badge-primary rounded-full py-1 cursor-pointer"
                    onClick={() => updateRuleValue(index, v)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6L18 18"
                      ></path>
                    </svg>
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <button
          onClick={addRule}
          className="mt-4 px-4 py-2 bg-white-500 border rounded hover:bg-white-700 cursor-pointer"
        >
          + AND
        </button>
      </div>
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
