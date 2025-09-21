import React from 'react';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { History, ArrowLeft, Eye, Undo } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockFormTemplates } from './FormLibrary'; // Assuming mock data is exported

const FormVersionHistory = () => {
    const { formId } = useParams();
    const form = mockFormTemplates.find(f => f.id === formId);

    if (!form) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-bold">Form Not Found</h2>
                <p className="text-gray-600">The form you are looking for does not exist.</p>
                <Link href="/form-library">
                    <Button variant="link" className="mt-4">Go back to Form Library</Button>
                </Link>
            </div>
        );
    }

    const versions = form.versions || [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/form-library">
                        <Button variant="outline" size="icon" aria-label="Go back">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <History className="h-6 w-6 text-purple-600" />
                            Version History: <span className="text-gray-700">{form.name}</span>
                        </h1>
                        <p className="text-sm text-gray-500">Viewing {versions.length} total versions.</p>
                    </div>
                </div>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Version</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Release Notes</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {versions.length > 0 ? (
                                versions.map((version, index) => (
                                    <TableRow key={version.version}>
                                        <TableCell className="font-medium">{version.version}</TableCell>
                                        <TableCell>{version.date}</TableCell>
                                        <TableCell>{version.author}</TableCell>
                                        <TableCell className="text-gray-600">{version.notes}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="mr-2">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Preview
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={index === 0}>
                                                <Undo className="mr-2 h-4 w-4" />
                                                Restore
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No version history found for this form.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default FormVersionHistory;