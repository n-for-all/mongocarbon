import { Fragment, useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "~/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/ui/select";
import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Switch } from "~/ui/switch";
import { Braces, Edit, FileJson2, Link2, Pen, Settings2, Trash } from "lucide-react";
import ValidationSchemaEditor from "./validation";
import { SchemaJson } from "./json-schema";
import Modal from "~/ui/modal";
import ValidationManager from "./validation-manager";

type Endpoint = {
    method: string;
    endpoint: string;
    description: string;
    permission: string;
    active: boolean;
    custom?: boolean;
    authorization?: boolean;
    validation?: object;
    logic?: string;
    response?: object;
};

type EndpointsProps = {
    collection: string;
    endpoints: Endpoint[];
    onChange: (collection: string, endpoints: Endpoint[]) => void;
};

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const permissions = ["read", "write", "admin", "none"];

const getDefaultEndpoints = (name: string) => {
    return [
        { method: "POST", endpoint: `/${name.trim()}`, description: "Create one", permission: "write", active: false },
        { method: "GET", endpoint: `/${name.trim()}`, description: `List ${name.trim()} with filters/pagination/sort/search`, permission: "read", active: false },
        { method: "GET", endpoint: `/${name.trim()}/:id`, description: `Get one by ID`, permission: "read", active: false },
        { method: "PUT", endpoint: `/${name.trim()}/:id`, description: `Replace entire ${name.trim()} record`, permission: "write", active: false },
        { method: "PATCH", endpoint: `/${name.trim()}/:id`, description: `Update fields of ${name.trim()} record`, permission: "write", active: false },
        { method: "DELETE", endpoint: `/${name.trim()}/:id`, description: `Delete ${name.trim()} record`, permission: "admin", active: false },
    ];
};

function mergeEndpoints(name: string, existing: Endpoint[] = []) {
    const defaultEndpoints = getDefaultEndpoints(name);
    const merged = defaultEndpoints.map((def) => {
        const found = existing.find((e) => e.method === def.method && e.endpoint === def.endpoint);
        return found ? { ...def, ...found, active: true } : { ...def, active: false };
    });
    // Add custom endpoints
    const customs = existing
        .filter((e) => !defaultEndpoints.some((def) => def.method === e.method && def.endpoint === e.endpoint))
        .map((e) => ({ ...e, custom: true, active: true }));
    return [...merged, ...customs];
}

export default function Endpoints({ collection, endpoints: collectionEndpoints, onChange }: EndpointsProps) {
    const [endpoints, setEndpoints] = useState<Endpoint[]>(mergeEndpoints(collection, collectionEndpoints));
    const [validationEndpoint, setValidationEndpoint] = useState<Endpoint | null>(null);

    return (
        <div className="pt-1 bg-white">
            {/* <SchemaJson
                data={{
                    $schema: "http://json-schema.org/draft/2020-12/schema",
                    type: "object",
                    properties: {
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                name: {
                                    allOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                firstName: { type: "string", minLength: 1 },
                                                lastName: { type: "string", minLength: 1 },
                                            },
                                            required: ["firstName", "lastName"],
                                        },
                                        {
                                            not: {
                                                properties: {
                                                    firstName: { pattern: "^admin" },
                                                },
                                            },
                                        },
                                    ],
                                },
                                email: { type: "string", format: "email" },
                            },
                            required: ["id", "name", "email"],
                        },
                        contact: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        phone: { type: "string", pattern: "^\\+?\\d{10,15}$" },
                                    },
                                    required: ["phone"],
                                },
                                {
                                    type: "object",
                                    properties: {
                                        email: { type: "string", format: "email" },
                                    },
                                    required: ["email"],
                                },
                            ],
                        },
                        role: {
                            oneOf: [{ const: "admin" }, { const: "user" }, { const: "guest" }],
                        },
                        preferences: {
                            type: "object",
                            properties: {
                                newsletter: { type: "boolean" },
                                notifications: {
                                    type: "array",
                                    items: { type: "string" },
                                    minItems: 1,
                                },
                            },
                        },
                    },
                    required: ["user", "role"],
                }}
            /> */}
            {/* <ValidationSchemaEditor
                value={{
                    bsonType: "object",
                    required: ["name", "email"],
                    properties: {
                        name: {
                            bsonType: "string",
                            description: "Name must be a string and is required",
                        },
                        email: {
                            bsonType: "string",
                            pattern: "^.+@.+$",
                            description: "Must be a valid email",
                        },
                        age: {
                            bsonType: "int",
                            minimum: 0,
                            description: "Age must be a non-negative integer",
                        },
                    },
                }}
            /> */}
            <Table className="border bg-neutral-100">
                <TableBody>
                    <TableRow className="border-b border-neutral-200 bg-neutral-50">
                        <TableCell className="font-bold">Enabled</TableCell>
                        <TableCell className="font-bold">Method</TableCell>
                        <TableCell className="font-bold">Endpoint</TableCell>
                        <TableCell className="font-bold">Description</TableCell>
                        <TableCell className="font-bold">Permission</TableCell>
                        <TableCell className="font-bold"></TableCell>
                    </TableRow>
                    {endpoints.map((ep, idx) => (
                        <Fragment key={idx}>
                            <TableRow key={idx} className="border-b-0">
                                <TableCell className="">
                                    <div className="flex items-center">
                                        <Switch
                                            size="xs"
                                            className="mr-1 bg-neutral-300"
                                            checked={ep.active}
                                            onCheckedChange={(checked) => {
                                                const updated = [...endpoints];
                                                updated[idx].active = checked;
                                                setEndpoints(updated);
                                            }}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={ep.method}
                                        onValueChange={(value) => {
                                            const updated = [...endpoints];
                                            updated[idx].method = value;
                                            setEndpoints(updated);
                                        }}>
                                        <SelectTrigger className="bg-white">{ep.method}</SelectTrigger>
                                        <SelectContent>
                                            {methods.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        value={ep.endpoint}
                                        className="border border-gray-300"
                                        onChange={(e) => {
                                            const updated = [...endpoints];
                                            updated[idx].endpoint = e.target.value;
                                            setEndpoints(updated);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        className="border border-gray-300"
                                        value={ep.description}
                                        onChange={(e) => {
                                            const updated = [...endpoints];
                                            updated[idx].description = e.target.value;
                                            setEndpoints(updated);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={ep.permission}
                                        onValueChange={(value) => {
                                            const updated = [...endpoints];
                                            updated[idx].permission = value;
                                            setEndpoints(updated);
                                        }}>
                                        <SelectTrigger className="bg-white">{ep.permission}</SelectTrigger>
                                        <SelectContent>
                                            {permissions.map((p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    {ep.custom ? (
                                        <Button
                                            size="xs"
                                            className="mr-4"
                                            variant="danger"
                                            hasIconOnly
                                            icon={<Trash />}
                                            onClick={() => {
                                                setEndpoints(endpoints.filter((_, i) => i !== idx));
                                            }}></Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                            <TableRow className="pt-0 border-b border-neutral-200" key={idx + "sep"}>
                                <TableCell colSpan={6} className="pt-0">
                                    <div className="inline-flex items-center gap-2 text-xs text-neutral-500">
                                        <div className="flex items-center flex-1 gap-1 px-2 py-1 text-xs bg-white border rounded text-neutral-500 border-neutral-200">
                                            Authorization:{" "}
                                            <Switch
                                                size="xs"
                                                className="ml-auto bg-neutral-300"
                                                checked={ep.authorization}
                                                onCheckedChange={(checked) => {
                                                    const updated = [...endpoints];
                                                    updated[idx].authorization = checked;
                                                    setEndpoints(updated);
                                                }}
                                            />
                                        </div>
                                        <div>&rarr;</div>
                                        <div className="flex items-center flex-1 gap-2 px-2 py-1 text-xs bg-white border rounded text-neutral-500 border-neutral-200">
                                            <span className="font-medium">Validation:</span>
                                            <a
                                                className="flex items-center gap-1 px-0 py-0 text-xs text-blue-600 hover:underline"
                                                href="#"
                                                onClick={(e) => {
                                                    setValidationEndpoint(endpoints[idx]);
                                                }}>
                                                <Settings2 className="w-3 h-3" strokeWidth={1.5} />
                                                Edit
                                            </a>
                                            <Switch
                                                size="xs"
                                                className="ml-auto bg-neutral-300"
                                                checked={ep.authorization}
                                                onCheckedChange={(checked) => {
                                                    const updated = [...endpoints];
                                                    updated[idx].authorization = checked;
                                                    setEndpoints(updated);
                                                }}
                                            />
                                        </div>
                                        <div>&rarr;</div>
                                        <div className="flex items-center flex-1 gap-1 px-2 py-1 text-xs bg-white border rounded text-neutral-500 border-neutral-200">
                                            Logic:
                                            <Switch
                                                size="xs"
                                                className="ml-auto bg-neutral-300"
                                                checked={ep.authorization}
                                                onCheckedChange={(checked) => {
                                                    const updated = [...endpoints];
                                                    updated[idx].authorization = checked;
                                                    setEndpoints(updated);
                                                }}
                                            />
                                        </div>
                                        <div>&rarr;</div>
                                        <div className="flex items-center flex-1 gap-1 px-2 py-1 text-xs bg-white border rounded text-neutral-500 border-neutral-200">
                                            Return:
                                            <Switch
                                                size="xs"
                                                className="ml-auto bg-neutral-300"
                                                checked={ep.authorization}
                                                onCheckedChange={(checked) => {
                                                    const updated = [...endpoints];
                                                    updated[idx].authorization = checked;
                                                    setEndpoints(updated);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </Fragment>
                    ))}
                    <TableRow>
                        <TableCell colSpan={5}>
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                    setEndpoints([
                                        ...endpoints,
                                        {
                                            method: "GET",
                                            endpoint: "",
                                            description: "",
                                            permission: "read",
                                            active: true,
                                            custom: true,
                                        },
                                    ]);
                                }}>
                                Add Custom Endpoint
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <ValidationManager
                open={!!validationEndpoint}
                onOpenChange={(open) => {
                    if (!open) setValidationEndpoint(null);
                }}
                onSave={(validation) => {
                    if (validationEndpoint) {
                        const updated = endpoints.map((ep) =>
                            ep.endpoint === validationEndpoint.endpoint && ep.method === validationEndpoint.method ? { ...ep, validation } : ep
                        );
                        setEndpoints(updated);
                        onChange(collection, updated);
                        setValidationEndpoint(null);
                    }
                }}
                endpoint={validationEndpoint?.endpoint || ""}
                validation={validationEndpoint?.validation || {}}></ValidationManager>
        </div>
    );
}
