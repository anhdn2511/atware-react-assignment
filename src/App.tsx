import React, { useState } from "react";
import Step1 from "./components/step-1";
import Step2 from "./components/step-2";
import Step3 from "./components/step-3";
import Step4 from "./components/step-4";
import dishData from "./data/dishes.json";
import {z} from "zod";
import { MealType } from "./data/MealType";
import { Restaurant } from "./data/Restaurant";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

interface OrderData {
  meal: string;
  people: number;
  restaurant: string;
  dishes: { id: number; name: string; servings: number }[];
}

const schema = z.object({
  meal: z.enum(MealType, {
    error: () => ({ message: "Invalid meal type" })
  }),
  people: z.number().int().positive().min(1).max(10),
  restaurant: z.enum(Restaurant),
  dishes: z.array(z.string()),
})

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OrderData>({
    meal: "",
    people: 1,
    restaurant: "",
    dishes: [],
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      meal: MealType.BREAKFAST,
      people: 1
    },
    mode: "onChange"
  })

  const { meal, people, dishes, restaurant } = form.watch()

  const filteredRestaurants = Array.from(
    new Set(
      dishData.dishes
        .filter((d) => d.availableMeals.includes(formData.meal))
        .map((d) => d.restaurant),
    ),
  );

  const filteredDishes = dishData.dishes.filter(
    (d) => d.restaurant === formData.restaurant,
  );

  const updateData = (newData: Partial<OrderData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep1 = async () => {
    await form.trigger(["meal", "people"]);
    if (form.formState.errors.meal || form.formState.errors.people) {
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <main>
      {step === 1 && (
        <Step1
          register={form.register}
          formData={{ meal, people }}
          peopleError={form.formState.errors.people?.message}
          onNext={handleNextStep1}
        />
      )}
      {step === 2 && (
        <Step2
          formData={formData}
          updateData={updateData}
          onNext={handleNext}
          onBack={handleBack}
          restaurants={filteredRestaurants}
        />
      )}
      {step === 3 && (
        <Step3
          formData={formData}
          updateData={updateData}
          onNext={handleNext}
          onBack={handleBack}
          availableDishes={filteredDishes}
        />
      )}
      {step === 4 && <Step4 formData={formData} onBack={handleBack} />}
    </main>
  );
};

export default App;
