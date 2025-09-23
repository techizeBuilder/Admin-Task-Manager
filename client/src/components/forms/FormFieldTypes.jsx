import { Type, Calendar, ChevronDown, CheckSquare, Hash, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fieldTypes = [
  {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    description: 'Single line text input'
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: FileText,
    description: 'Multi-line text input'
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Email address input'
  },
  {
    type: 'phone',
    label: 'Phone',
    icon: Phone,
    description: 'Phone number input'
  },
  {
    type: 'number',
    label: 'Number',
    icon: Hash,
    description: 'Numeric input'
  },
  {
    type: 'date',
    label: 'Date',
    icon: Calendar,
    description: 'Date picker input'
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    icon: ChevronDown,
    description: 'Single selection dropdown'
  },
  {
    type: 'multiselect',
    label: 'Multi-select',
    icon: CheckSquare,
    description: 'Multiple selection checkboxes'
  }
];

export function FormFieldTypes({ onAddField }) {
  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <Type className="h-5 w-5 mr-2 text-purple-600" />
          Field Types
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Click any field type to add it to your form
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-2">
          {fieldTypes.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <Button
                key={fieldType.type}
                variant="ghost"
                className="h-auto p-3 justify-start hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all duration-200"
                onClick={() => onAddField(fieldType.type)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm text-slate-900 dark:text-white">
                      {fieldType.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {fieldType.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}