import React, { useState, useEffect } from 'react';

interface SubstitutionField {
  name: string;
  type: 'varchar' | 'bigint' | 'double';
  defaultValue?: string;
  options?: string[]; // TODO: Implement options retrieval
}

interface SubstitutionEditorProps {
  query: string;
  onSubstitutionChange: (substitutions: Record<string, string>) => void;
}

const SubstitutionEditor: React.FC<SubstitutionEditorProps> = ({ query, onSubstitutionChange }) => {
  const [fields, setFields] = useState<SubstitutionField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const extractedFields = extractSubstitutionFields(query);
    setFields(extractedFields);
    const initialValues = extractedFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    }, {} as Record<string, string>);
    setValues(initialValues);
    onSubstitutionChange(initialValues);
  }, [query]);

  const handleInputChange = (name: string, value: string) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      onSubstitutionChange(newValues);
      return newValues;
    });
  };

  const extractSubstitutionFields = (query: string): SubstitutionField[] => {
    const regex = /\/\*\s*\{\{\s*([A-z\s0-9]+)(?::(varchar|bigint|double)?(?::([a-zA-Z0-9\.-_\s]+)?)?)?\s*\}\}\s*\*\//g;
    const fields: SubstitutionField[] = [];
    let match;

    while ((match = regex.exec(query)) !== null) {
      fields.push({
        name: match[1],
        type: (match[2] as 'varchar' | 'bigint' | 'double') || 'varchar',
        defaultValue: match[3],
      });
    }

    return fields;
  };

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="substitution-editor">
      <h3>Query Parameters</h3>
      {fields.map((field) => (
        <div key={field.name} className="substitution-field">
          <label htmlFor={field.name}>{field.name}:</label>
          <input
            type={field.type === 'varchar' ? 'text' : 'number'}
            id={field.name}
            value={values[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.defaultValue}
          />
        </div>
      ))}
    </div>
  );
};

export default SubstitutionEditor;