
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface BrandDataPreviewProps {
  brandName: string;
  preview: string[][];
}

export const BrandDataPreview = ({ brandName, preview }: BrandDataPreviewProps) => {
  if (preview.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Aperçu des données - {brandName} (5 premières lignes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={i === 0 ? 'font-semibold bg-gray-50' : ''}>
                  {row.slice(0, 5).map((cell, j) => (
                    <td key={j} className="border p-1 truncate max-w-32">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
