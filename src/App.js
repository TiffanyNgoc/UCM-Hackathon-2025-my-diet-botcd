import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "2fbd08af0ecb4068a06b38b08cb53677"; // Replace with API key

function App() {
  const [ingredients, setIngredients] = useState("");
  const [mealPlan, setMealPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [points, setPoints] = useState(() => {
    return parseInt(localStorage.getItem("points")) || 0;
  });
  const [world, setWorld] = useState(() => {
    return JSON.parse(localStorage.getItem("world")) || { trees: 0, animals: 0, water: 0 };
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("points", points);
  }, [points]);

  useEffect(() => {
    localStorage.setItem("world", JSON.stringify(world));
  }, [world]);

  const generateMealPlan = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setMealPlan([]);

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&apiKey=${API_KEY}`
      );
      const data = await response.json();

      const detailedMeals = await Promise.all(
        data.map(async (meal) => {
          const nutritionRes = await fetch(
            `https://api.spoonacular.com/recipes/${meal.id}/nutritionWidget.json?apiKey=${API_KEY}`
          );
          const nutritionData = await nutritionRes.json();

          return {
            id: meal.id,
            name: meal.title,
            image: meal.image,
            missedIngredients: meal.missedIngredientCount,
            usedIngredients: meal.usedIngredientCount,
            link: `https://spoonacular.com/recipes/${meal.title.replace(/\s+/g, "-")}-${meal.id}`,
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            carbs: nutritionData.carbs,
            fat: nutritionData.fat,
          };
        })
      );

      setMealPlan(detailedMeals);
      setPoints((prev) => prev + 10);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorldClick = (type) => {
    if (points >= 5) {
      setWorld((prevWorld) => ({
        ...prevWorld,
        [type]: prevWorld[type] + 1,
      }));
      setPoints((prev) => prev - 5);
    }
  };

  return (
    <div className="app-container">
      <button
        className="toggle-button"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <div className="card">
        <h2 className="title"><span role="img" aria-label="salad">🥗</span> Diet Bot</h2>
        <p className="description">Enter ingredients & get real meal plans!</p>
        <h3 className="points"><span role="img" aria-label="star">🌟</span> Points: {points}</h3>
        <h3 className="world-title"><span role="img" aria-label="earth">🌍</span> Virtual World Progress</h3>
        <div className="world-container">
          <div className="world-item tree" onClick={() => handleWorldClick("trees")}>
            <span role="img" aria-label="tree">🌳</span> <span className="world-count">{world.trees}</span>
          </div>
          <div className="world-item animal" onClick={() => handleWorldClick("animals")}>
            <span role="img" aria-label="deer">🦌</span> <span className="world-count">{world.animals}</span>
          </div>
          <div className="world-item water" onClick={() => handleWorldClick("water")}>
            <span role="img" aria-label="water">💧</span> <span className="world-count">{world.water}</span>
          </div>
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Available ingredients (e.g., chicken, rice)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="input-box"
          />
          <button onClick={generateMealPlan} className="fetch-button" disabled={loading}>
            {loading ? "Fetching..." : "🍽 Get Meal Plan"}
          </button>
        </div>

        <div className="recipe-list-container">
          <h3 className="recipe-title">🍽 Suggested Meal Plan:</h3>
          <div className="recipe-list">
            {mealPlan.length > 0 ? (
              <ul>
                {mealPlan.map((meal) => (
                  <li key={meal.id} className="recipe-item">
                    <img src={meal.image} alt={meal.name} className="meal-image" />
                    <div className="meal-info">
                      <strong>{meal.name}</strong>
                      <p>{meal.missedIngredients} missing ingredients, {meal.usedIngredients} used.</p>
                      <a href={meal.link} target="_blank" rel="noopener noreferrer">View Recipe</a>
                      <div className="nutrition-info">
                        <p><span role="img" aria-label="calories">🔥</span> {meal.calories} kcal</p>
                        <p><span role="img" aria-label="protein">💪</span> {meal.protein}</p>
                        <p><span role="img" aria-label="carbs">🍞</span> {meal.carbs}</p>
                        <p><span role="img" aria-label="fat">🧈</span> {meal.fat}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-recipes">{loading ? "" : "Enter ingredients to get real meal plans!"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 
