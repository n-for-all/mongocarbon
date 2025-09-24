import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem } from "~/ui/select";
import { Input } from "~/ui/input";
import { Button } from "~/ui/button";
import JSONInput from "./json-input/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/ui/table";
import { Plus, Trash } from "lucide-react";
import Modal from "~/ui/modal";

const paramTypes = { string: "String", number: "Number", objectid: "ObjectId", in: "In" };

function extractParams(endpoint: string) {
    // Matches :param or {param}
    const matches = [...endpoint.matchAll(/:([a-zA-Z0-9_]+)|{([a-zA-Z0-9_]+)}/g)];
    return matches.map((m) => m[1] || m[2]);
}

type ValidationManagerProps = {
    endpoint: string;
    validation: { params?: Record<string, { type: string; value?: string }>; query?: { name: string; type: string }[]; body?: Record<string, any> };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saving: boolean;
    onSave: (validation: { params: any; query: any; body: any }) => void;
};

export default function ValidationManager({ validation, endpoint, onSave, open, onOpenChange, saving }: ValidationManagerProps) {
    const [tab, setTab] = useState("params");
    const [params, setParams] = useState<Record<string, { type: string; value?: string }>>(validation?.params || {});
    const [query, setQuery] = useState<{ name: string; type: string; value?: string }[]>(validation?.query || []);
    const [body, setBody] = useState(validation?.body || {});
    const [bodyError, setBodyError] = useState<string | null>(null);

    // Extract params from endpoint
    const urlParams = extractParams(endpoint);

    const handleParamTypeChange = (param: string, name:string, value: string) => {
        const updated = { ...params, [param]: { ...params[param], [name]: value } };
        setParams(updated);
    };

    // Handle query change
    const handleQueryChange = (idx: number, field: string, value: string) => {
        const updated = query.map((q, i) => (i === idx ? { ...q, [field]: value } : q));
        setQuery(updated);
    };

    // Add query param
    const handleAddQuery = () => {
        setQuery([...query, { name: "", type: "string" }]);
    };

    // Remove query param
    const handleRemoveQuery = (idx: number) => {
        const updated = query.filter((_, i) => i !== idx);
        setQuery(updated);
    };

    // Handle body change
    const handleBodyChange = (value: string) => {
        setBodyError(null);
        try {
            let jsonBody = JSON.parse(value);
            setBody(jsonBody);
        } catch (e) {
            setBodyError("Invalid JSON: " + (e as Error).message);
        }
    };

    return (
        <Modal
            open={open}
            loading={saving}
            modalLabel="Edit Validation"
            loadingDescription="Saving validation rules..."
            modalHeading="Define validation rules for request parameters"
            primaryButtonText="Save rules"
            secondaryButtonText="Cancel"
            onPrimaryClick={() => {
                if (bodyError) return;
                onSave({ params, query: query.filter((q) => q.name.trim() !== ""), body: Object.keys(body).length ? body : null });
            }}
            onClose={() => {
                onOpenChange(false);
            }}>
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4 bg-neutral-200">
                    <TabsTrigger value="params">Params</TabsTrigger>
                    <TabsTrigger value="query">Query</TabsTrigger>
                    <TabsTrigger value="body">Body</TabsTrigger>
                </TabsList>
                <TabsContent value="params">
                    <div>
                        <div className="mb-2 font-semibold">
                            URL: <span className="text-blue-700">{endpoint}</span>
                        </div>
                        {urlParams.length === 0 ? (
                            <div className="text-sm text-neutral-500">No params found in URL.</div>
                        ) : (
                            <Table className="w-full text-sm bg-white">
                                <TableHeader>
                                    <TableRow>
                                        <TableCell className="py-1 text-left">Param</TableCell>
                                        <TableCell className="py-1 text-left">Type</TableCell>
                                        <TableCell className="py-1 text-left"></TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {urlParams.map((param) => (
                                        <TableRow key={param}>
                                            <TableCell className="py-1">{param}</TableCell>
                                            <TableCell className="py-1">
                                                <Select value={params[param]?.type || "string"} onValueChange={(type) => handleParamTypeChange(param, "type", type)}>
                                                    <SelectTrigger className="w-32">{params[param]?.type || "string"}</SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(paramTypes).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="py-1">
                                                {params[param]?.type == "in" ? (
                                                    <Input
                                                        value={params[param]?.value || ""}
                                                        placeholder="Comma separated values..."
                                                        onChange={(e) => handleParamTypeChange(param, "value", e.target.value)}
                                                    />
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="query">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Query Parameters</span>
                            <Button size="sm" variant="outline" onClick={handleAddQuery}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Query Param
                            </Button>
                        </div>
                        <Table className="w-full text-sm bg-white">
                            <TableHeader>
                                <TableRow>
                                    <TableCell className="py-1 text-left">Name</TableCell>
                                    <TableCell className="py-1 text-left">Type</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {query.length > 0 ? (
                                    query.map((q, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="py-1">
                                                <Input value={q.name} placeholder="Name" onChange={(e) => handleQueryChange(idx, "name", e.target.value)} />
                                            </TableCell>
                                            <TableCell className="py-1">
                                                <Select value={q.type} onValueChange={(type) => handleQueryChange(idx, "type", type)}>
                                                    <SelectTrigger className="w-32">{q.type}</SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(paramTypes).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="py-1">
                                                {q.type == "in" ? (
                                                    <Input
                                                        value={q.value || ""}
                                                        placeholder="Comma separated values..."
                                                        onChange={(e) => handleQueryChange(idx, "value", e.target.value)}
                                                    />
                                                ) : null}
                                            </TableCell>
                                            <TableCell>
                                                <Button hasIconOnly size="xs" variant="danger_ghost" onClick={() => handleRemoveQuery(idx)}>
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="">
                                        <TableCell colSpan={3} className="py-2 text-sm text-center text-neutral-500">
                                            No query parameters defined.
                                            <a
                                                href="#"
                                                className="ml-1 text-blue-600 underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleAddQuery();
                                                }}>
                                                Add one?
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="body">
                    <div className="flex flex-col">
                        <div className="mb-2 font-semibold">Body Schema (JSON Schema)</div>
                        {bodyError && <div className="mb-2 text-sm text-red-600">{bodyError}</div>}
                        <div className="flex ">
                            <div className="flex-1 overflow-auto border" style={{ maxHeight: "400px" }}>
                                <JSONInput
                                    theme="github_light"
                                    value={body || {}}
                                    className="text-xs "
                                    inputClassName="font-mono min-h-48"
                                    onChange={(data) => {
                                        handleBodyChange(data.json);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Modal>
    );
}
