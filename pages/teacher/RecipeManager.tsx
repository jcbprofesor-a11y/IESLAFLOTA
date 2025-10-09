import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { ComposeMessageModal } from '../shared/Messaging';
import { PlusIcon, DownloadIcon, ShareIcon, PencilIcon } from '../../components/icons';
import { printPage } from '../../utils/export';
import { Recipe, Message, User } from '../../types';

const ShareRecipeModal: React.FC<{ 
    recipe: Recipe; 
    onClose: () => void; 
    onSend: (message: any) => void;
    users: User[];
}> = ({ recipe, onClose, onSend, users }) => {
    
    const recipeBody = `
¡Hola!

Te comparto esta receta que podría interesarte:

**${recipe.name}**

**Descripción:**
${recipe.description}

**Rendimiento:** ${recipe.yieldAmount} ${recipe.yieldUnit}

**Preparación:**
${recipe.preparationSteps}

---
Este mensaje ha sido generado automáticamente.
    `;

    return (
        <ComposeMessageModal 
            users={users}
            onClose={onClose}
            onSend={onSend}
            initialSubject={`Receta compartida: ${recipe.name}`}
            initialBody={recipeBody}
        />
    );
};


export const RecipeManager: React.FC = () => {
    const { recipes, setRecipes, users, messages, setMessages } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [recipeToShare, setRecipeToShare] = useState<Recipe | null>(null);

    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const productsMap = useMemo(() => {
        const { products } = useData(); // Get latest products
        return new Map(products.map(p => [p.id, p]));
    }, [useData().products]);

    const filteredRecipes = useMemo(() => {
        if (!searchTerm) return recipes;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return recipes.filter(recipe => {
            // Search by recipe name
            if (recipe.name.toLowerCase().includes(lowerCaseSearch)) return true;
            // Search by ingredient name
            return recipe.ingredients.some(ing => 
                productsMap.get(ing.productId)?.name.toLowerCase().includes(lowerCaseSearch)
            );
        });
    }, [recipes, searchTerm, productsMap]);

    const myRecipes = useMemo(() => filteredRecipes.filter(r => r.authorId === currentUser?.id), [filteredRecipes, currentUser]);
    const publicRecipes = useMemo(() => filteredRecipes.filter(r => r.isPublic && r.authorId !== currentUser?.id), [filteredRecipes, currentUser]);

    const handleDuplicate = (recipe: Recipe) => {
        if (!currentUser) return;
        const newRecipe: Recipe = {
            ...recipe,
            id: `rec-${Date.now()}`,
            authorId: currentUser.id,
            name: `${recipe.name} (Copia)`,
            isPublic: false, // Duplicates are private by default
        };
        setRecipes(prev => [...prev, newRecipe]);
        navigate(`/teacher/recipes/edit/${newRecipe.id}`);
    };

    const handleShare = (message: Omit<Message, 'id' | 'date' | 'senderId'>) => {
        if (!currentUser) return;
        const fullMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            date: new Date().toISOString(),
            readBy: {},
            ...message
        };
        setMessages([...messages, fullMessage]);
        setRecipeToShare(null);
        alert('¡Receta compartida!');
    };


    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Mis Recetas</h1>
                <div className="no-print flex items-center space-x-2">
                    <Link to="/teacher/recipes/new" className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nueva Receta
                    </Link>
                </div>
            </div>

            <Card>
                <input
                    type="search"
                    placeholder="Buscar por nombre de receta o ingrediente..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md mb-6 dark:bg-gray-700"
                />

                {/* My Recipes */}
                <h2 className="text-2xl font-semibold mb-3">Mis Fichas</h2>
                {myRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myRecipes.map(recipe => (
                            <div key={recipe.id} className="p-4 border rounded-lg dark:border-gray-600 shadow-sm bg-blue-50 dark:bg-blue-900/20">
                                <h3 className="font-bold text-lg">{recipe.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{recipe.description}</p>
                                <div className="mt-2 text-xs">
                                    <span>Coste: {recipe.cost.toFixed(2)}€</span>
                                    <span className="ml-4">Precio: {recipe.price.toFixed(2)}€</span>
                                </div>
                                <div className="text-right mt-2 no-print flex justify-end items-center space-x-3">
                                     <button onClick={() => setRecipeToShare(recipe)} title="Compartir" className="text-gray-500 hover:text-primary-600"><ShareIcon className="w-5 h-5"/></button>
                                     <Link to={`/teacher/recipes/edit/${recipe.id}`} title="Editar" className="text-primary-600 hover:underline"><PencilIcon className="w-5 h-5"/></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No tienes recetas. <Link to="/teacher/recipes/new" className="text-primary-600 hover:underline">¡Crea la primera!</Link></p>
                )}

                {/* Public Recipes */}
                <h2 className="text-2xl font-semibold mt-8 mb-3">Fichas Públicas</h2>
                 {publicRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {publicRecipes.map(recipe => (
                            <div key={recipe.id} className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                <h3 className="font-bold text-lg">{recipe.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{recipe.description}</p>
                                <p className="text-xs text-gray-400 mt-1">Autor: {usersMap.get(recipe.authorId)?.name || 'Desconocido'}</p>
                                <div className="text-right mt-2 no-print flex justify-end items-center space-x-3">
                                     <button onClick={() => setRecipeToShare(recipe)} title="Compartir" className="text-gray-500 hover:text-primary-600"><ShareIcon className="w-5 h-5"/></button>
                                     <button onClick={() => handleDuplicate(recipe)} className="text-sm bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700">Hacer Mía</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay otras recetas públicas disponibles.</p>
                )}
            </Card>

            {recipeToShare && (
                <ShareRecipeModal 
                    recipe={recipeToShare}
                    onClose={() => setRecipeToShare(null)}
                    onSend={handleShare}
                    users={users}
                />
            )}
        </div>
    );
};