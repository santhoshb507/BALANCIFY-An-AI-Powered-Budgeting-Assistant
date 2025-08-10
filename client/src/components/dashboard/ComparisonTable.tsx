import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';

interface ComparisonData {
  category: string;
  before: number;
  after: number;
  impact: number;
  unit?: string;
}

interface ComparisonTableProps {
  data: ComparisonData[];
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  return (
    <Card className="glass-effect border-white/20">
      <CardContent className="p-8">
        <h3 className="font-orbitron text-2xl font-bold mb-6 text-center flex items-center justify-center">
          <ArrowUpDown className="mr-3 text-cosmic-400" />
          Transformation Analysis
        </h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600">
                <TableHead className="text-left text-white font-orbitron">Category</TableHead>
                <TableHead className="text-center text-red-400 font-medium">Before Optimization</TableHead>
                <TableHead className="text-center text-neon-green font-medium">After Optimization</TableHead>
                <TableHead className="text-center text-neon-cyan font-medium">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="border-gray-700 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-white">{row.category}</TableCell>
                  <TableCell className="text-center text-gray-300">
                    {row.unit === 'currency' ? `₹${(row.before || 0).toLocaleString()}` : 
                     row.unit === 'months' ? `${row.before || 0} months` : 
                     (row.before || 0).toString()}
                  </TableCell>
                  <TableCell className="text-center text-gray-300">
                    {row.unit === 'currency' ? `₹${(row.after || 0).toLocaleString()}` : 
                     row.unit === 'months' ? `${row.after || 0} months` : 
                     (row.after || 0).toString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      (row.impact || 0) > 0 
                        ? (row.category.includes('Timeline') || row.category.includes('Debt') ? 'text-red-400' : 'text-neon-green')
                        : (row.impact || 0) < 0 
                        ? (row.category.includes('Timeline') || row.category.includes('Debt') ? 'text-neon-green' : 'text-red-400')
                        : 'text-gray-400'
                    }`}>
                      {(row.impact || 0) > 0 && !row.category.includes('Timeline') && !row.category.includes('Debt') ? '+' : ''}
                      {row.unit === 'currency' ? `₹${Math.abs(row.impact || 0).toLocaleString()}` : 
                       row.unit === 'months' ? `${row.impact || 0} months` : 
                       (row.impact || 0).toString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
