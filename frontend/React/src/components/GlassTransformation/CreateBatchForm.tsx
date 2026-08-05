import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface CreateBatchFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const CreateBatchForm: React.FC<CreateBatchFormProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    processId: '',
    rawMaterialQuantity: '',
    plannedStartDate: '',
    operatorId: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/glassTransformation/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId: parseInt(formData.processId),
          rawMaterialQuantity: parseFloat(formData.rawMaterialQuantity),
          plannedStartDate: formData.plannedStartDate,
          operatorId: formData.operatorId
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du lot');
      }

      setFormData({
        processId: '',
        rawMaterialQuantity: '',
        plannedStartDate: '',
        operatorId: ''
      });

      onSuccess?.();
    } catch (error) {
      onError?.((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un Nouveau Lot de Transformation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sélection du processus */}
          <div>
            <Label htmlFor="processId" className="text-sm font-medium text-slate-700">
              Processus de Transformation
            </Label>
            <Select value={formData.processId} onValueChange={(value) => handleChange('processId', value)}>
              <SelectTrigger id="processId">
                <SelectValue placeholder="Sélectionnez un processus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Verre Blanc Standard (800°C)</SelectItem>
                <SelectItem value="2">Verre Coloré Bleu (850°C)</SelectItem>
                <SelectItem value="3">Verre Teinté Vert (810°C)</SelectItem>
                <SelectItem value="4">Verre Renforcé (900°C)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantité de matière première */}
          <div>
            <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
              Quantité de Matière Première (kg)
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000"
              value={formData.rawMaterialQuantity}
              onChange={(e) => handleChange('rawMaterialQuantity', e.target.value)}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Poids total de verre brut à transformer</p>
          </div>

          {/* Date de démarrage planifiée */}
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
              Date de Démarrage Planifiée
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.plannedStartDate}
              onChange={(e) => handleChange('plannedStartDate', e.target.value)}
              required
            />
          </div>

          {/* Opérateur responsable */}
          <div>
            <Label htmlFor="operatorId" className="text-sm font-medium text-slate-700">
              Opérateur Responsable
            </Label>
            <Select value={formData.operatorId} onValueChange={(value) => handleChange('operatorId', value)}>
              <SelectTrigger id="operatorId">
                <SelectValue placeholder="Sélectionnez un opérateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="op-001">Ahmed Mohamed - Opérateur Senior</SelectItem>
                <SelectItem value="op-002">Fatima Ali - Opérateur Qualité</SelectItem>
                <SelectItem value="op-003">Mohamed Karim - Opérateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> La quantité de sortie prévue sera calculée automatiquement 
              en tenant compte du rendement standard de {92}%.
            </p>
          </div>

          {/* Bouton de soumission */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer le Lot'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBatchForm;
