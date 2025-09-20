import { Input } from "~/ui/input";
import { useState } from "react";
import { Button } from "~/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "~/ui/select";

type Property = {
    bsonType: string;
    description?: string;
    pattern?: string;
    minimum?: number;
    required?: string[];
    properties?: Record<string, Property>;
};

type Schema = {
    bsonType: "object";
    required: string[];
    properties: Record<string, Property>;
};

const bsonTypes = ["string", "int", "double", "bool", "date", "objectId", "array", "object"];

function PropertyEditor({
    name,
    property,
    required,
    onChange,
    onRemove,
    onToggleRequired,
}: {
    name: string;
    property: Property;
    required: boolean;
    onChange: (prop: Property) => void;
    onRemove: () => void;
    onToggleRequired: () => void;
}) {
    return (
        <div className="p-3 mb-4 bg-white border rounded">
            <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={required} onChange={onToggleRequired} />
                <Input value={name} onChange={(e) => onChange({ ...property, name: e.target.value })} className="w-32" placeholder="Field name" />
                <Select value={property.bsonType} onValueChange={(bsonType) => onChange({ ...property, bsonType })}>
                    <SelectTrigger>{property.bsonType}</SelectTrigger>
                    <SelectContent>
                        {bsonTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="xs" variant="danger" onClick={onRemove}>
                    Delete
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
                <Input value={property.description || ""} onChange={(e) => onChange({ ...property, description: e.target.value })} placeholder="Description" />
                <Input value={property.pattern || ""} onChange={(e) => onChange({ ...property, pattern: e.target.value })} placeholder="Pattern" />
                <Input
                    type="number"
                    value={property.minimum ?? ""}
                    onChange={(e) => onChange({ ...property, minimum: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Minimum"
                />
            </div>
            {/* Nested object support */}
            {property.bsonType === "object" && (
                <div className="mt-2 ml-4">
                    <strong>Nested Properties:</strong>
                    <ValidationSchemaEditor
                        value={{
                            bsonType: "object",
                            required: property.required || [],
                            properties: property.properties || {},
                        }}
                        onChange={(nestedSchema) =>
                            onChange({
                                ...property,
                                required: nestedSchema.required,
                                properties: nestedSchema.properties,
                            })
                        }
                    />
                </div>
            )}
        </div>
    );
}

export default function ValidationSchemaEditor({ value, onChange }: { value: Schema; onChange: (schema: Schema) => void }) {
    const [schema, setSchema] = useState<Schema>(value);

    function updateProperty(key: string, prop: Property) {
        const updated = {
            ...schema,
            properties: {
                ...schema.properties,
                [key]: prop,
            },
        };
        setSchema(updated);
        onChange(updated);
    }

    function addProperty() {
        let newKey = "field" + (Object.keys(schema.properties).length + 1);
        while (schema.properties[newKey]) {
            newKey += "_";
        }
        const updated = {
            ...schema,
            properties: {
                ...schema.properties,
                [newKey]: { bsonType: "string", description: "" },
            },
        };
        setSchema(updated);
        onChange(updated);
    }

    function removeProperty(key: string) {
        const { [key]: _, ...rest } = schema.properties;
        const updated = {
            ...schema,
            properties: rest,
            required: schema.required.filter((r) => r !== key),
        };
        setSchema(updated);
        onChange(updated);
    }

    function toggleRequired(key: string) {
        const required = schema.required.includes(key) ? schema.required.filter((r) => r !== key) : [...schema.required, key];
        const updated = { ...schema, required };
        setSchema(updated);
        onChange(updated);
    }

    return (
        <div className="p-4 border rounded bg-neutral-50">
            <h3 className="mb-4 text-lg font-bold">Schema Editor</h3>
            <div className="mb-4">
                <Button size="sm" variant="primary" onClick={addProperty}>
                    Add Property
                </Button>
            </div>
            <div>
                {Object.entries(schema.properties).map(([key, prop]) => (
                    <PropertyEditor
                        key={key}
                        name={key}
                        property={prop}
                        required={schema.required.includes(key)}
                        onChange={(updatedProp) => updateProperty(key, updatedProp)}
                        onRemove={() => removeProperty(key)}
                        onToggleRequired={() => toggleRequired(key)}
                    />
                ))}
            </div>
        </div>
    );
}
