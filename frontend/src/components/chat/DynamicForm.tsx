import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Check } from "lucide-react";
import api from "@/lib/api";

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "select_dynamic" | "date" | "number";
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  default?: string;
}

interface FormSchema {
  form_type: string;
  title: string;
  fields: FormField[];
  entity_id?: number;
  current_values?: Record<string, any>;
}

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit: (result: any) => void;
  onCancel: () => void;
}

export default function DynamicForm({ schema, onSubmit, onCancel }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, Array<{ value: string; label: string }>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialData: Record<string, any> = {};
    
    schema.fields.forEach((field) => {
      if (schema.current_values && schema.current_values[field.name] !== undefined) {
        initialData[field.name] = schema.current_values[field.name];
      } else if (field.default) {
        initialData[field.name] = field.default;
      } else {
        initialData[field.name] = "";
      }
    });
    
    setFormData(initialData);
    loadDynamicOptions();
  }, [schema]);

  const loadDynamicOptions = async () => {
    const dynamicFields = schema.fields.filter((f) => f.type === "select_dynamic");
    
    if (dynamicFields.length === 0) return;
    
    setIsLoadingOptions(true);
    const options: Record<string, Array<{ value: string; label: string }>> = {};
    
    for (const field of dynamicFields) {
      if (field.endpoint) {
        try {
          const response = await api.get<any>(field.endpoint);
          const items = response.results || response.data || response || [];
          
          options[field.name] = items.map((item: any) => ({
            value: String(item[field.valueField || "id"]),
            label: item[field.labelField || "name"],
          }));
        } catch (error) {
          console.error(`Error loading options for ${field.name}:`, error);
          options[field.name] = [];
        }
      }
    }
    
    setDynamicOptions(options);
    setIsLoadingOptions(false);
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    schema.fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post<any>("/bot/form/submit/", {
        form_type: schema.form_type,
        entity_id: schema.entity_id,
        data: formData,
      });
      
      onSubmit(response);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setErrors({ _form: error.message || "Failed to submit form" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || "";
    const error = errors[field.name];

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-red-500" : ""}
              rows={3}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleChange(field.name, val)}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      case "select_dynamic":
        const options = dynamicOptions[field.name] || [];
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {isLoadingOptions ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading options...
              </div>
            ) : (
              <Select
                value={String(value)}
                onValueChange={(val) => handleChange(field.name, val)}
              >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{schema.title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors._form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {errors._form}
          </div>
        )}
        
        {schema.fields.map(renderField)}
        
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary hover:bg-primary-hover"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {schema.entity_id ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
