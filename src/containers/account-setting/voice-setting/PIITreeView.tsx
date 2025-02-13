import { PiiCategory } from "@/features/settings/types";
import { useState } from "react";

type PiiCategoryItem = {
  key: string,
  details: string;
  category: string | null;
  checked: boolean,
  children: PiiCategoryItem[];
};

const piiData: PiiCategoryItem[] = [
  // GENERAL
  {
    key: "general", details: "General", category: null, checked: true, children: [
      {
        key: "general_1", details: "Companies, political groups, musical bands, sport clubs, government bodies, and public organizations Nationalities and religions are not included", category: null, checked: true, children: [
          { key: "general_11", details: "Medical companies and groups", category: "ORGANIZATION", checked: true, children: [] },
          { key: "general_12", details: "Stock exchange groups", category: "ORGANIZATION", checked: true, children: [] },
          { key: "general_13", details: "Sports-related organizations", category: "ORGANIZATION", checked: true, children: [] }
        ]
      },
      {
        key: "general_2", details: "Dates and times", category: null, checked: true, children:[
          { key: "general_21", details: "Calendar dates", category: "DATETIME", checked: true, children: [] },
          { key: "general_22", details: "Dates and times of day", category: "DATETIME", checked: true, children: [] },
        ],
      },
      { key: "general_3", details: "Full mailing address", category: "ADDRESS", checked: true, children: [] },
      { key: "general_4", details: "Ages", category: "AGE", checked: true, children:[] },
      { key: "general_5", details: "Email addresses", category: "EMAIL", checked: true, children: [] },
      { key: "general_6", details: "Network IP addresses", category: "IP_ADDRESS", checked: true, children: [] },
      { key: "general_7", details: "Names of people", category: "PERSON", checked: true, children : [] },
      { key: "general_8", details: "Job types or roles held by a person", category: null, checked: true, children: [] },
      { key: "general_9", details: "Phone numbers (US and EU only)", category: "PHONE_NUMBER", checked: true, children: [] },
      { key: "general_10", details: "URLs to websites", category: "URL", checked: true, children: [] }
    ]
  },
  // FINANCIAL
  { 
    key: "financial", details: "Financial", category: null, checked: true, children: [
      { key: "financial_1", details: "ABA transit routing numbers", category: "ABA_ROUTING_NUMBER", checked: true, children: [] },
      { key: "financial_2", details: "SWIFT codes for payment instruction information", category: "SWIFT_CODE", checked: true, children: [] },
      { key: "financial_3", details: "Credit card numbers", category: "CREDIT_CARD_NUMBER", checked: true, children: [] },
      { key: "financial_4", details: "International Bank Account Numbers (IBAN)", category: "INTERNATIONAL_BANKING_ACCOUNT_NUMBER", checked: true, children: [] },
    ]
  },
  // COUNTRY
  { 
    key: "country", details: "Country", category: null, checked: true, children: [
      { key: "country_1", details: "Argentina National Identity (DNI) Number", category: "AR_NATIONAL_IDENTITY_NUMBER", checked: true, children: [] },
      { key: "country_2", details: "Austria identity card", category: "AT_IDENTITY_CARD", checked: true, children: [] },
      { key: "country_3", details: "Austria tax identification number", category: "AT_TAX_IDENTIFICATION_NUMBER", checked: true, children: [] },
      { key: "country_4", details: "Austria Value Added Tax (VAT) number", category: "AT_VALUE_ADDED_TAX_NUMBER", checked: true, children: [] },
      { key: "country_5", details: "Australia bank account number", category: "AU_BANK_ACCOUNT_NUMBER", checked: true, children: [] },
      { key: "country_6", details: "Australian business number", category: "AU_BUSINESS_NUMBER", checked: true, children: [] },
      { key: "country_7", details: "Australia Company Number", category: "AU_COMPANY_NUMBER", checked: true, children: [] },
      { key: "country_8", details: "Australia driver's license", category: "AU_DRIVERS_LICENSE_NUMBER", checked: true, children: [] },
      { key: "country_9", details: "Australia medical account number", category: "AU_MEDICAL_ACCOUNT_NUMBER", checked: true, children: [] },
      { key: "country_10", details: "Australia passport number", category: "AU_PASSPORT_NUMBER", checked: true, children: [] },
      { key: "country_11", details: "Australia tax file number", category: "AU_TAX_FILE_NUMBER", checked: true, children: [] },
      { key: "country_12", details: "Belgium national number", category: "BE_NATIONAL_NUMBER", checked: true, children: [] },
      { key: "country_13", details: "Belgium national number (Version 2, deprecated)", category: "BE_NATIONAL_NUMBER_V2", checked: true, children: [] },
      { key: "country_14", details: "Belgium Value Added Tax number", category: "BE_VALUE_ADDED_TAX_NUMBER", checked: true, children: [] },
      { key: "country_15", details: "Brazil legal entity number (CNPJ)", category: "BR_LEGAL_ENTITY_NUMBER", checked: true, children: [] },
      { key: "country_16", details: "Brazil CPF number", category: "BRCPF_NUMBER", checked: true, children: [] },
      { key: "country_17", details: "Brazil National ID Card (RG)", category: "BR_NATIONAL_IDRG", checked: true, children: [] },
      { key: "country_18", details: "Canada bank account number", category: "CA_BANK_ACCOUNT_NUMBER", checked: true, children: [] },
      { key: "country_19", details: "Canada driver's license number", category: "CA_DRIVERS_LICENSE_NUMBER", checked: true, children: [] },
      { key: "country_20", details: "Canada health service number", category: "CA_HEALTH_SERVICE_NUMBER", checked: true, children: [] },
      { key: "country_21", details: "Canada passport number", category: "CA_PASSPORT_NUMBER", checked: true, children: [] },
      { key: "country_22", details: "Canada Personal Health Identification Number (PHIN)", category: "CA_PERSONAL_HEALTH_IDENTIFICATION", checked: true, children: [] },
      { key: "country_23", details: "Canada social insurance number", category: "CA_SOCIAL_INSURANCE_NUMBER", checked: true, children: [] },
      { key: "country_24", details: "Chile identity card number", category: "CL_IDENTITY_CARD_NUMBER", checked: true, children: [] },
      { key: "country_25", details: "China Resident Identity Card (PRC) number", category: "CN_RESIDENT_IDENTITY_CARD_NUMBER", checked: true, children: [] },
    ]
  }
];

type PIITreeViewProps = {
  piiCategories: PiiCategory[];
  onChange?: (selectedCategories: PiiCategory[]) => void;
};

const PIITreeView: React.FC<PIITreeViewProps> = ({
  piiCategories,
  onChange,
}) => {
  const [treeData, setTreeData] = useState(piiData);

  const getAllCategories = (items: PiiCategoryItem[]): PiiCategory[] => {
    return items.flatMap((item) => [
      { key: item.key, category: item.category },
      ...getAllCategories(item.children || []),
    ]);
  };

  const [selectedCategories, setSelectedCategories] = useState<
    PiiCategory[]
  >(piiCategories ?? getAllCategories(piiData));

  // Get all children recursively
  const getAllChildCategories = (item: PiiCategoryItem): PiiCategory[] => {
    const children = item.children || [];
    const childCategories = children.flatMap(getAllChildCategories);
    return [{ key: item.key, category: item.category }, ...childCategories];
  };

  // Handle checkbox change
  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: PiiCategoryItem,
  ) => {
    const isChecked = event.target.checked;

    // Update selected categories
    const updatedCategories = isChecked
      ? [
          ...selectedCategories,
          ...getAllChildCategories(item).filter(
            (cat) =>
              !selectedCategories.some((prevCat) => prevCat.key === cat.key),
          ),
        ]
      : selectedCategories.filter(
          (cat) =>
            !getAllChildCategories(item).some(
              (childCat) => childCat.key === cat.key,
            ),
        );

    // Set the updated categories state
    setSelectedCategories(updatedCategories);

    // Notify parent of the updated selection
    if (onChange) {
      onChange(updatedCategories);
    }

    // Update tree data checked state
    const updatedTreeData = updateTreeData(treeData, item.key, isChecked);
    setTreeData(updatedTreeData);
  };

  // Update the checked state recursively
  const updateTreeData = (
    items: PiiCategoryItem[],
    key: string,
    isChecked: boolean,
  ): PiiCategoryItem[] => {
    return items.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          checked: isChecked,
          children: updateCheckedState(isChecked, item.children),
        };
      }

      return {
        ...item,
        children: updateTreeData(item.children, key, isChecked),
      };
    });
  };

  // Update children state recursively
  const updateCheckedState = (
    isChecked: boolean,
    items: PiiCategoryItem[] = [],
  ): PiiCategoryItem[] => {
    return items.map((child) => ({
      ...child,
      checked: isChecked,
      children: updateCheckedState(isChecked, child.children),
    }));
  };

  // Render tree nodes
  const renderTreeNode = (treeData: PiiCategoryItem[]) => {
    return (
      <ul className="space-y-2">
        {treeData.map((item: PiiCategoryItem) => (
          <li key={item.key} className="flex flex-col">
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id={`checkbox_${item.key}`}
                checked={selectedCategories.some((cat) => cat.key === item.key)}
                onChange={(event) => handleCheckboxChange(event, item)}
                className="h-4 w-4"
              />
              <label
                htmlFor={`checkbox_${item.key}`}
                className="ms-2 text-sm font-medium"
              >
                {item.details}
              </label>
            </div>

            {/* Render children if present */}
            {item.children && (
              <div className="ml-4">{renderTreeNode(item.children)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return <>{renderTreeNode(treeData)}</>;
};

export default PIITreeView;
