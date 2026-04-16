You are helping me implement nutrition and meal section in this app that is already started that stores all data locally (no API calls).
I need you to generate a complete, simple, accurate system for calculating recommended daily calories and protein intake based on user data.

The app already collects:

Age

Sex

Height

Weight

Activity level

Fitness goal (lose weight, maintain, gain muscle)

I need you to produce:

1. Calorie Recommendation System
Use the Mifflin–St Jeor equation for BMR:

Men: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age + 5

Women: BMR = 10 × weight(kg) + 6.25 × height(cm) – 5 × age – 161

Then multiply by activity factor to get TDEE:

Sedentary: 1.2

Lightly active: 1.375

Moderately active: 1.55

Very active: 1.725

Extremely active: 1.9

Then adjust based on goal:

Weight loss: TDEE – 300

Maintenance: TDEE

Muscle gain: TDEE + 200

Output the final recommended calorie target.

2. Protein Recommendation System
Use evidence‑based sports nutrition guidelines:

Weight loss: 1.8 g per kg

Maintenance: 1.4 g per kg

Muscle gain: 1.6 g per kg

Output the recommended daily protein target.

3. Provide the logic in clean pseudocode
Make it easy to implement in any language (TypeScript preferred but not required).

4. Provide a simple explanation for users
Write a short, friendly explanation I can show inside the app describing:

Why these calorie targets work

Why protein matters

Why the numbers are personalized

Keep it simple and motivational.

5. Provide example outputs
Give 2–3 example users with:

Age

Sex

Height

Weight

Activity level

Goal

Final recommended calories

Final recommended protein

6. Keep everything self‑contained
No external APIs.
No external databases.
All formulas must be usable offline.

Generate everything cleanly, clearly, and ready for implementation.