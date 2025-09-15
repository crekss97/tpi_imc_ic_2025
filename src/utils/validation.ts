//Representa el resultado de una validación
export interface ValidationResult {
  isValid: boolean; //Indica si el valor es válido
  error?: string;   //Mensaje de error (solo aparee si isValid es false)
}

//Define las reglas de validación (mínimo y máximo) para peso y altura
export interface ImcValidationRules {
  peso: {
    min: number;
    max: number;
  };
  altura: {
    min: number;
    max: number;
  };
}

//Nueva reglas de validación
//Valores mínimos y máximos para peso y altura
export const IMC_VALIDATION_RULES: ImcValidationRules = {
  peso: {
    min: 0.1,
    max: 500,
  },
  altura: {
    min: 0.1,
    max: 3.0,
  },
};

//Valida el pso sea correcto según las reglas
export const validatePeso = (peso: string | number): ValidationResult => {

  //Si el peso viene como string, lo convierte a número  
  const pesoNum = typeof peso === "string" ? parseFloat(peso) : peso;
  
  //Validación 1: El campo no puede estar vacío
  if (!peso || peso === "") {
    return { isValid: false, error: "El peso es requerido" };
  }

  //Validación 2: Debe ser un número válido
  if (isNaN(pesoNum)) {
    return { isValid: false, error: "El peso debe ser un número válido" };
  }

  //Validación 3: No puede ser 0 ni negativo
  if (pesoNum <= 0) {
    return { isValid: false, error: "El peso debe ser mayor a 0" };
  }

  //Validación 4: No pude ser mayor al máximo permitido
  if (pesoNum > IMC_VALIDATION_RULES.peso.max) {
    return {
      isValid: false,
      error: `El peso no puede ser mayor a ${IMC_VALIDATION_RULES.peso.max} kg`,
    };
  }

  //Validación 5: No puede ser menor al mínimo permitido
  if (pesoNum < IMC_VALIDATION_RULES.peso.min) {
    return {
      isValid: false,
      error: `El peso debe ser mayor a ${IMC_VALIDATION_RULES.peso.min} kg`,
    };
  }
  
  //Si pasa todas las validaciones, es válido
  return { isValid: true };
};

// Valida que la altura sea correcta según las reglas
export const validateAltura = (altura: string | number): ValidationResult => {
  // Si la altura viene como string lo convertimos a número
  const alturaNum = typeof altura === "string" ? parseFloat(altura) : altura;
  
  // Validación 1: El campo no puede estar vacío
  if (!altura || altura === "") {
    return { isValid: false, error: "La altura es requerida" };
  }
  
   // Validación 2: Debe ser un número válido
  if (isNaN(alturaNum)) {
    return { isValid: false, error: "La altura debe ser un número válido" };
  }
  
  // Validación 3: No puede ser 0 ni negativo
  if (alturaNum <= 0) {
    return { isValid: false, error: "La altura debe ser mayor a 0" };
  }
  
  // Validación 4: No puede ser mayor al máximo permitido
  if (alturaNum > IMC_VALIDATION_RULES.altura.max) {
    return {
      isValid: false,
      error: `La altura no puede ser mayor a ${IMC_VALIDATION_RULES.altura.max} metros`,
    };
  }
  
  // Validación 5: No puede ser menor al mínimo permitido
  if (alturaNum < IMC_VALIDATION_RULES.altura.min) {
    return {
      isValid: false,
      error: `La altura debe ser mayor a ${IMC_VALIDATION_RULES.altura.min} metros`,
    };
  }
  
  // Si pasa todas las validaciones → es válida
  return { isValid: true };
};

// Valida el formulario completo (altura + peso)
export const validateImcForm = (
  altura: string,
  peso: string
): ValidationResult => {
  // Primero validamos la altura  
  const alturaValidation = validateAltura(altura);
  if (!alturaValidation.isValid) {
    return alturaValidation; // Si es inválida, devolvemos ese error
  }
   // Luego validamos el peso
  const pesoValidation = validatePeso(peso);
  if (!pesoValidation.isValid) {
    return pesoValidation; // Si es inválido, devolvemos ese error
  }

  return { isValid: true };
};