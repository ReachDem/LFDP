// app/categories/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  // const { categories: categoriesService } = useServices();

  // const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories
  const loadCategories = (async () => {
    try {
      // const data = await categoriesService.getAll();
      // setCategories(data);
      // console.log(data);
      setError(null);
    } catch (err: unknown) {
      setError("Failed to load categories");
      toast.error("Failed to load categories", {
        description:
          err instanceof Error ? err.message : "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  }
  // , [categoriesService]
  ); // Remove toast from dependencies

  useEffect(() => {
    loadCategories();
  }, []); // Add loadCategories as dependency

  // Ajouter une catégorie
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      // await categoriesService.create(newCategory.trim());
      await loadCategories();
      setNewCategory("");
      toast.success("Catégorie ajoutée avec succès");
    } catch (err: unknown) {
      toast.error("Erreur d'ajout", {
        description:
          err instanceof Error ? err.message : "Erreur d'ajout",
      });
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (id: string) => {
    try {
      // await categoriesService.delete(id);
      await loadCategories();
      toast.info('Catégorie supprimée');
    } catch (err: unknown) {
      toast.message('Erreur de suppression',{
        description:
          err instanceof Error ? err.message : "Erreur de suppression",
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Catégories
        </h1>
        <Badge variant="outline" className="hidden md:flex">
          {/* {categories.length} */}
           au total
        </Badge>
      </div>

      <form onSubmit={handleAddCategory} className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Nom de la nouvelle catégorie"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-xs rounded-xl border-primary/20"
        />
        <Button 
          type="submit" 
          disabled={!newCategory.trim()} 
          className="transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2 md:inline-block" />
          <span className="hidden md:inline">Ajouter une catégorie</span>
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead>Nom</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {categories.map((category) => ( */}
                <TableRow 
                  // key={category.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {/* {category.name} */}
                    <Badge 
                      variant="secondary" 
                      className="ml-2 hidden md:inline-flex"
                    >
                      ID:
                       {/* {category.id.slice(0, 4)} */}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {/* {new Date(category.created_at).toLocaleDateString()} */}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="transition-all hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Supprimer</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600">
                            Supprimer la catégorie
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer <span className="font-semibold">
                              {/* {category.name} */}
                              </span>?
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="transition-all hover:scale-105">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                           
                            className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105"
                          >
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              {/* // ))} */}
              {/* {categories.length === 0 && ( */}
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              {/* )} */}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
