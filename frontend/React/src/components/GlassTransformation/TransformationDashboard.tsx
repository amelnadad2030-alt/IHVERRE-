import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

interface BatchData {
  id: number;
  batchNumber: string;
  status: 'Planned' | 'InProgress' | 'Cooling' | 'QualityCheck' | 'Approved' | 'Rejected' | 'Completed';
  currentTemperature: number;
  targetTemperature: number;
  progress: number;
  qualityScore: number;
}

export const TransformationDashboard: React.FC = () => {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  useEffect(() => {
    // Charger les données des lots
    fetchBatches();
    // Mettre à jour les données toutes les 30 secondes
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/glassTransformation/batches');
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Erreur lors du chargement des lots:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Planned': 'bg-gray-100 text-gray-800',
      'InProgress': 'bg-blue-100 text-blue-800',
      'Cooling': 'bg-orange-100 text-orange-800',
      'QualityCheck': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Approved' || status === 'Completed') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (status === 'Rejected') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <TrendingUp className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Tableau de Bord - Transformation du Verre
        </h1>
        <p className="text-slate-600">Suivi en temps réel des processus de transformation</p>
      </div>

      {/* Cards de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lots en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.filter(b => b.status === 'InProgress').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Qualité moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(batches.reduce((acc, b) => acc + b.qualityScore, 0) / batches.length || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {batches.filter(b => b.status === 'Approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {batches.filter(b => b.status === 'Rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de température */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Évolution de la Température</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actualTemp" 
                stroke="#3b82f6" 
                name="Température actuelle"
              />
              <Line 
                type="monotone" 
                dataKey="targetTemp" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Température cible"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Liste des lots */}
      <Card>
        <CardHeader>
          <CardTitle>Lots en Cours de Transformation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch) => (
              <div 
                key={batch.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                onClick={() => setSelectedBatch(batch.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(batch.status)}
                    <span className="font-semibold text-slate-900">{batch.batchNumber}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Température</p>
                    <p className="font-semibold">{batch.currentTemperature}°C / {batch.targetTemperature}°C</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Progression</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${batch.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-600">Qualité</p>
                    <p className={`font-semibold ${batch.qualityScore >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
                      {batch.qualityScore}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransformationDashboard;
