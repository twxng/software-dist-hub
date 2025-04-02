// import React, { useState, useEffect } from 'react';
// import { useAuthStore } from '../store/authStore';
// import { useNavigate } from 'react-router-dom';
// import { contentService } from '../services/contentService';
// import { ContentUnit } from '../types/content';
// // import { ContentTable } from '../components/ContentTable';

// const ContentManagement: React.FC = () => {
//   const { isAuthenticated, userRole } = useAuthStore();
//   const navigate = useNavigate();
//   const [error, setError] = useState<string | null>(null);
//   const [contentItems, setContentItems] = useState<ContentUnit[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     // Перевіряємо авторизацію
//     if (!isAuthenticated) {
//       setError('Необхідно увійти в систему');
//     } else if (userRole !== 'Admin') {
//       setError('Недостатньо прав для доступу до цієї сторінки');
//     } else {
//       // Якщо авторизація успішна, завантажуємо контент
//       loadContent();
//     }
//   }, [isAuthenticated, userRole]);

//   const loadContent = async () => {
//     try {
//       setIsLoading(true);
      
//       // Оптимізований підхід для отримання контенту
//       const validContent: ContentUnit[] = [];
//       const idsToTry = Array.from({ length: 20 }, (_, i) => i + 1);
      
//       // Використовуємо Promise.allSettled для паралельного завантаження
//       const results = await Promise.allSettled(
//         idsToTry.map(id => contentService.getContentById(id))
//       );
      
//       // Обробляємо результати без зайвого логування
//       results.forEach((result, index) => {
//         if (result.status === 'fulfilled' && result.value.statusCode === 200 && result.value.data) {
//           validContent.push(result.value.data);
//         }
//       });
      
//       setContentItems(validContent);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Помилка завантаження контенту');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (error) {
//     return (
//       <div className="error-container">
//         <h2>Помилка доступу</h2>
//         <p>{error}</p>
//         <button onClick={() => navigate('/')}>Повернутися на головну</button>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return <div className="loading">Завантаження...</div>;
//   }

//   return (
//     <div>
//       <h1>Управління контентом</h1>
//       {/* <div className="content-list">
//         {contentItems.length > 0 ? (
//           <ContentTable contentItems={contentItems} />
//         ) : (
//           <p>Content not found</p>
//         )}
//       </div> */}
//     </div>
//   );
// };

// export default ContentManagement; 