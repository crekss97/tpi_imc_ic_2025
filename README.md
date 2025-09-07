# Proyecto IMC - Frontend

Aplicación frontend desarrollada con **React + Vite + TypeScript** para calcular el **Índice de Masa Corporal (IMC)**.  
Este proyecto forma parte del trabajo práctico integrador de la cátedra *Ingeniería y Calidad de Software - UTN FRVM*.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)
- [Git](https://git-scm.com/)

---

## Instalación y ejecución en local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/crekss97/tpi_imc_ic_2025.git
   cd tpi_imc_ic_2025
   ```
2. Instalar dependencias:
    ```bash
   npm install
   ```
3. Ejecutar en modo desarrollo
   ```bash
   npm run dev
   ```

## Despliegue de la Aplicación

Se utilizó Vercel para el despliegue de la Aplicación

Pasos para el despliegue de una aplicación en Vercel

1. Crear una cuenta en [Vercel](https://vercel.com/signup)
2. Importar este repositorio desde GitHub.
3. Configuraciones a realizar
- Build Command: npm run build
- Output Directory: .public
- Install Command:  npm install
- Development Command: none
4. Guardar y desplegar.

##  Colaboración en equipo
- La rama principal de despliegue es main.
- Se utiliza la rama test para la subida de cambios, luego se pasan a la rama main mediante un merge.