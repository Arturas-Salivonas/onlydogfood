'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Edit2, Save, X } from 'lucide-react';
import type { ProductIngredient, ProductIngredientGroup } from '@/types';

interface IngredientEditorProps {
  productId: string;
  ingredientsRaw: string;
}

export function IngredientEditor({ productId, ingredientsRaw }: IngredientEditorProps) {
  const [ingredients, setIngredients] = useState<ProductIngredient[]>([]);
  const [groups, setGroups] = useState<ProductIngredientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProductIngredient>>({});

  useEffect(() => {
    fetchIngredients();
  }, [productId]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}/ingredients`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParse = async (force = false) => {
    if (!ingredientsRaw || ingredientsRaw.trim().length === 0) {
      alert('No ingredient data to parse');
      return;
    }

    if (!force && ingredients.length > 0) {
      if (!confirm('This product already has parsed ingredients. Re-parse and overwrite?')) {
        return;
      }
    }

    try {
      setParsing(true);
      const response = await fetch(`/api/admin/products/${productId}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ingredients_raw: ingredientsRaw,
          force: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
        setGroups(data.groups || []);
        alert(`Success! Parsed ${data.ingredients.length} ingredients.\n\n` +
              `Warnings:\n` +
              `${data.analysis.hasIngredientSplitting ? '⚠️ Ingredient splitting detected\n' : ''}` +
              `${data.analysis.hasFillerStuffing ? '⚠️ Filler stuffing detected\n' : ''}` +
              `Effective meat: ${data.analysis.effectiveMeatPercent}%`);
      } else {
        const error = await response.json();
        alert(`Failed to parse: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error parsing ingredients:', error);
      alert('Error parsing ingredients');
    } finally {
      setParsing(false);
    }
  };

  const handleEdit = (ingredient: ProductIngredient) => {
    setEditingId(ingredient.id);
    setEditValues({
      percentage_declared: ingredient.percentage_declared,
      notes: ingredient.notes,
    });
  };

  const handleSave = async (ingredientId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ingredient_id: ingredientId,
          updates: {
            ...editValues,
            manually_verified: true,
          },
        }),
      });

      if (response.ok) {
        await fetchIngredients();
        setEditingId(null);
        setEditValues({});
      } else {
        alert('Failed to update ingredient');
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Error updating ingredient');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  const splitGroups = groups.filter(g => g.is_split_suspected);
  const hasWarnings = splitGroups.length > 0 ||
                       ingredients.filter(i => i.is_filler).length > 20;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🥩</span>
            Ingredient Analysis (v3.0)
          </h2>
          {ingredients.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {ingredients.length} ingredients analyzed
            </p>
          )}
        </div>

        <button
          onClick={() => handleParse(ingredients.length > 0)}
          disabled={parsing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {parsing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Parsing...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              {ingredients.length > 0 ? 'Re-parse' : 'Parse Ingredients'}
            </>
          )}
        </button>
      </div>

      {/* Warnings */}
      {hasWarnings && ingredients.length > 0 && (
        <div className="mb-6 space-y-2">
          {splitGroups.map(group => (
            <div key={group.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-yellow-800">
                    Ingredient Splitting Detected ({group.split_severity})
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {group.group_type.replace('-', ' ')} appears {group.ingredient_count} times: {' '}
                    {group.member_ingredients.map(m => m.name).join(', ')}
                  </p>
                  <p className="text-sm text-yellow-700 font-semibold mt-1">
                    Combined: {group.total_percentage?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}

          {ingredients.filter(i => i.is_filler).length > 20 && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex items-start">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-orange-800">
                    Filler Stuffing Detected
                  </h3>
                  <p className="text-sm text-orange-700 mt-1">
                    {ingredients.filter(i => i.is_filler).length} filler ingredients detected (likely label padding)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingredient Table */}
      {ingredients.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Ingredient</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">%</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Quality</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Flags</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const isEditing = editingId === ingredient.id;
                const percentage = ingredient.percentage_declared || ingredient.percentage_estimated || 0;

                return (
                  <tr
                    key={ingredient.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      ingredient.manually_verified ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="py-2 px-2 text-sm">{ingredient.position}</td>
                    <td className="py-2 px-2">
                      <div className="text-sm font-medium text-gray-900">
                        {ingredient.ingredient_name}
                      </div>
                      {ingredient.notes && (
                        <div className="text-xs text-gray-500 italic">{ingredient.notes}</div>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editValues.percentage_declared || ''}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            percentage_declared: parseFloat(e.target.value) || null,
                          })}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className={`text-sm ${ingredient.percentage_declared ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                          {percentage.toFixed(1)}%
                          {ingredient.percentage_declared && (
                            <CheckCircle className="inline ml-1 text-green-600" size={14} />
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {ingredient.category || 'other'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ingredient.quality_tier === 'premium' ? 'bg-green-100 text-green-800' :
                        ingredient.quality_tier === 'filler' ? 'bg-red-100 text-red-800' :
                        ingredient.quality_tier === 'low-quality' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ingredient.quality_tier || 'unknown'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-1">
                        {ingredient.is_meat_source && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700" title="Meat source">🥩</span>
                        )}
                        {ingredient.is_filler && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700" title="Filler">⚠️</span>
                        )}
                        {ingredient.is_artificial && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700" title="Artificial">🚫</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSave(ingredient.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit percentage"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No ingredients parsed yet</p>
          <p className="text-sm">Click "Parse Ingredients" button above to analyze this product</p>
        </div>
      )}
    </div>
  );
}
