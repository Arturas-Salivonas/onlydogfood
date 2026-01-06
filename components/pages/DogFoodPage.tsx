'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHero } from '@/components/layout/PageHero';
import { useProducts } from '@/lib/queries/products';
import { FilterOptions } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { getScoreColor } from '@/scoring/calculator';
import { formatPrice } from '@/lib/utils/format';
import { ChevronRight, Filter } from 'lucide-react';
import { PageSEO, CollectionPageStructuredData, createCollectionItem } from '@/components/seo';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { LazyLoad } from '@/components/performance/LazyLoad';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';

// Country to flag SVG mapping
const flags: Record<string, string> = {
  'United Kingdom': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect><path d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z" fill="#fff"></path><path d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z" fill="#b92932"></path><path d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z" fill="#b92932"></path><path d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z" fill="#fff"></path><rect x="13" y="4" width="6" height="24" fill="#fff"></rect><rect x="1" y="13" width="30" height="6" fill="#fff"></rect><rect x="14" y="4" width="4" height="24" fill="#b92932"></rect><rect x="14" y="1" width="4" height="30" transform="translate(32) rotate(90)" fill="#b92932"></rect><path d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z" fill="#b92932"></path><path d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z" fill="#b92932"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'UK': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect><path d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z" fill="#fff"></path><path d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z" fill="#b92932"></path><path d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z" fill="#b92932"></path><path d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z" fill="#fff"></path><rect x="13" y="4" width="6" height="24" fill="#fff"></rect><rect x="1" y="13" width="30" height="6" fill="#fff"></rect><rect x="14" y="4" width="4" height="24" fill="#b92932"></rect><rect x="14" y="1" width="4" height="30" transform="translate(32) rotate(90)" fill="#b92932"></rect><path d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z" fill="#b92932"></path><path d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z" fill="#b92932"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'United States': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>`,
  'US': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>`,
  'USA': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect><path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#a62842"></path><path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#a62842"></path><path fill="#a62842" d="M2 11.385H31V13.231H2z"></path><path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path><path fill="#a62842" d="M1 18.769H31V20.615H1z"></path><path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#a62842"></path><path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#a62842"></path><path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path fill="#fff" d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"></path><path fill="#fff" d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"></path><path fill="#fff" d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"></path><path fill="#fff" d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"></path><path fill="#fff" d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"></path><path fill="#fff" d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"></path><path fill="#fff" d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"></path><path fill="#fff" d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"></path><path fill="#fff" d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"></path><path fill="#fff" d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"></path><path fill="#fff" d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"></path><path fill="#fff" d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"></path><path fill="#fff" d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"></path><path fill="#fff" d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"></path><path fill="#fff" d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"></path><path fill="#fff" d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"></path><path fill="#fff" d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"></path><path fill="#fff" d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"></path></svg>`,
  'Germany': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#cc2b1d" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#f8d147"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'France': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#092050"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#be2a2c"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'Italy': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#41914d"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#bf393b"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'Spain': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#f1c142" d="M1 10H31V22H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v3H1v-3c0-2.208,1.792-4,4-4Z" fill="#a0251e"></path><path d="M5,21H27c2.208,0,4,1.792,4,4v3H1v-3c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24.5)" fill="#a0251e"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path><path d="M12.614,13.091c.066-.031,.055-.14-.016-.157,.057-.047,.02-.15-.055-.148,.04-.057-.012-.144-.082-.13,.021-.062-.042-.127-.104-.105,.01-.068-.071-.119-.127-.081,.004-.068-.081-.112-.134-.069-.01-.071-.11-.095-.15-.035-.014-.068-.111-.087-.149-.028-.027-.055-.114-.057-.144-.004-.03-.047-.107-.045-.136,.002-.018-.028-.057-.044-.09-.034,.009-.065-.066-.115-.122-.082,.002-.07-.087-.111-.138-.064-.013-.064-.103-.087-.144-.036-.02-.063-.114-.075-.148-.017-.036-.056-.129-.042-.147,.022-.041-.055-.135-.031-.146,.036-.011-.008-.023-.014-.037-.016,.006-.008,.01-.016,.015-.025h.002c.058-.107,.004-.256-.106-.298v-.098h.099v-.154h-.099v-.101h-.151v.101h-.099v.154h.099v.096c-.113,.04-.169,.191-.11,.299h.002c.004,.008,.009,.017,.014,.024-.015,.002-.029,.008-.04,.017-.011-.067-.106-.091-.146-.036-.018-.064-.111-.078-.147-.022-.034-.057-.128-.046-.148,.017-.041-.052-.131-.028-.144,.036-.051-.047-.139-.006-.138,.064-.056-.033-.131,.017-.122,.082-.034-.01-.072,.006-.091,.034-.029-.047-.106-.049-.136-.002-.03-.054-.117-.051-.143,.004-.037-.059-.135-.04-.149,.028-.039-.06-.14-.037-.15,.035-.053-.043-.138,0-.134,.069-.056-.038-.137,.013-.127,.081-.062-.021-.125,.044-.104,.105-.05-.009-.096,.033-.096,.084h0c0,.017,.005,.033,.014,.047-.075-.002-.111,.101-.055,.148-.071,.017-.082,.125-.016,.157-.061,.035-.047,.138,.022,.154-.013,.015-.021,.034-.021,.055h0c0,.042,.03,.077,.069,.084-.023,.048,.009,.11,.06,.118-.013,.03-.012,.073-.012,.106,.09-.019,.2,.006,.239,.11-.015,.068,.065,.156,.138,.146,.06,.085,.133,.165,.251,.197-.021,.093,.064,.093,.123,.118-.013,.016-.043,.063-.055,.081,.024,.013,.087,.041,.113,.051,.005,.019,.004,.028,.004,.031,.091,.501,2.534,.502,2.616-.001v-.002s.004,.003,.004,.004c0-.003-.001-.011,.004-.031l.118-.042-.062-.09c.056-.028,.145-.025,.123-.119,.119-.032,.193-.112,.253-.198,.073,.01,.153-.078,.138-.146,.039-.104,.15-.129,.239-.11,0-.035,.002-.078-.013-.109,.044-.014,.07-.071,.049-.115,.062-.009,.091-.093,.048-.139,.069-.016,.083-.12,.022-.154Zm-.296-.114c0,.049-.012,.098-.034,.141-.198-.137-.477-.238-.694-.214-.002-.009-.006-.017-.011-.024,0,0,0-.001,0-.002,.064-.021,.074-.12,.015-.153,0,0,0,0,0,0,.048-.032,.045-.113-.005-.141,.328-.039,.728,.09,.728,.393Zm-.956-.275c0,.063-.02,.124-.054,.175-.274-.059-.412-.169-.717-.185-.007-.082-.005-.171-.011-.254,.246-.19,.81-.062,.783,.264Zm-1.191-.164c-.002,.05-.003,.102-.007,.151-.302,.013-.449,.122-.719,.185-.26-.406,.415-.676,.73-.436-.002,.033-.005,.067-.004,.101Zm-1.046,.117c0,.028,.014,.053,.034,.069,0,0,0,0,0,0-.058,.033-.049,.132,.015,.152,0,0,0,.001,0,.002-.005,.007-.008,.015-.011,.024-.219-.024-.495,.067-.698,.206-.155-.377,.323-.576,.698-.525-.023,.015-.039,.041-.039,.072Zm3.065-.115s0,0,0,0c0,0,0,0,0,0,0,0,0,0,0,0Zm-3.113,1.798v.002s-.002,0-.003,.002c0-.001,.002-.003,.003-.003Z" fill="#9b8028"></path><path d="M14.133,16.856c.275-.65,.201-.508-.319-.787v-.873c.149-.099-.094-.121,.05-.235h.072v-.339h-.99v.339h.075c.136,.102-.091,.146,.05,.235v.76c-.524-.007-.771,.066-.679,.576h.039s0,0,0,0l.016,.036c.14-.063,.372-.107,.624-.119v.224c-.384,.029-.42,.608,0,.8v1.291c-.053,.017-.069,.089-.024,.123,.007,.065-.058,.092-.113,.083,0,.026,0,.237,0,.269-.044,.024-.113,.03-.17,.028v.108s0,0,0,0v.107s0,0,0,0v.107s0,0,0,0v.108s0,0,0,0v.186c.459-.068,.895-.068,1.353,0v-.616c-.057,.002-.124-.004-.17-.028,0-.033,0-.241,0-.268-.054,.008-.118-.017-.113-.081,.048-.033,.034-.108-.021-.126v-.932c.038,.017,.073,.035,.105,.053-.105,.119-.092,.326,.031,.429l.057-.053c.222-.329,.396-.743-.193-.896v-.35c.177-.019,.289-.074,.319-.158Z" fill="#9b8028"></path><path d="M8.36,16.058c-.153-.062-.39-.098-.653-.102v-.76c.094-.041,.034-.115-.013-.159,.02-.038,.092-.057,.056-.115h.043v-.261h-.912v.261h.039c-.037,.059,.039,.078,.057,.115-.047,.042-.108,.118-.014,.159v.873c-.644,.133-.611,.748,0,.945v.35c-.59,.154-.415,.567-.193,.896l.057,.053c.123-.103,.136-.31,.031-.429,.032-.018,.067-.036,.105-.053v.932c-.055,.018-.069,.093-.021,.126,.005,.064-.059,.089-.113,.081,0,.026,0,.236,0,.268-.045,.024-.113,.031-.17,.028v.401h0v.215c.459-.068,.895-.068,1.352,0v-.186s0,0,0,0v-.108s0,0,0,0v-.107s0,0,0,0v-.107s0,0,0,0v-.108c-.056,.002-.124-.004-.169-.028,0-.033,0-.241,0-.269-.055,.008-.119-.018-.113-.083,.045-.034,.03-.107-.024-.124v-1.29c.421-.192,.383-.772,0-.8v-.224c.575,.035,.796,.314,.653-.392Z" fill="#9b8028"></path><path d="M12.531,14.533h-4.28l.003,2.572v1.485c0,.432,.226,.822,.591,1.019,.473,.252,1.024,.391,1.552,.391s1.064-.135,1.544-.391c.364-.197,.591-.587,.591-1.019v-4.057Z" fill="#a0251e"></path></svg>`,
  'Netherlands': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#a1292a"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#264387"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'Belgium': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#f8dc51" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#dd4446"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
  'Canada': `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M8 4H24V28H8z"></path><path d="M5,4h4V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#c53a28"></path><path d="M27,4h4V28h-4c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 27 16)" fill="#c53a28"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M16.275,22.167l-.138-2.641c-.007-.16,.117-.296,.277-.304,.021,0,.042,0,.063,.004l2.629,.462-.355-.979c-.03-.08-.005-.17,.061-.223l2.88-2.332-.649-.303c-.091-.043-.135-.146-.104-.242l.569-1.751-1.659,.352c-.093,.019-.186-.029-.223-.116l-.321-.756-1.295,1.389c-.076,.08-.201,.083-.281,.007-.049-.047-.071-.115-.058-.182l.624-3.22-1.001,.578c-.095,.056-.217,.024-.272-.071-.002-.004-.004-.008-.006-.012l-1.016-1.995-1.016,1.995c-.049,.098-.169,.138-.267,.089-.004-.002-.008-.004-.012-.006l-1.001-.578,.624,3.22c.021,.108-.05,.212-.158,.233-.067,.013-.135-.009-.182-.058l-1.295-1.389-.321,.756c-.037,.087-.131,.136-.223,.116l-1.659-.352,.569,1.751c.031,.095-.013,.199-.104,.242l-.649,.303,2.88,2.332c.066,.054,.091,.144,.061,.223l-.355,.979,2.629-.462c.158-.027,.309,.079,.336,.237,.004,.021,.005,.042,.004,.063l-.138,2.641h.551Z" fill="#c53a28"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
};

// Country to flag SVG mapping
const getCountryFlag = (country: string | null): string => {
  if (!country) return '';

  return flags[country] || '🌍';
};

export default function DogFoodPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    sort: 'score-desc',
    page: 1,
    limit: 20,
    priceRange: 'all',
    minScoreFilter: 'all',
    brands: [],
    lifeStage: 'all',
    breedSize: 'all',
    specialDiet: [],
  });

  const { data, isLoading, error } = useProducts(filters);

  // Debug logging
  console.log('DogFoodPage - filters:', JSON.stringify(filters, null, 2));
  console.log('DogFoodPage - data:', data ? { total: data.total, dataLength: data.data?.length } : null);
  console.log('DogFoodPage - isLoading:', isLoading);
  console.log('DogFoodPage - error:', error);

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: category as any, page: 1 });
  };

  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort: sort as any, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prepare collection items for structured data
  const collectionItems = data?.data?.slice(0, 20).map(product =>
    createCollectionItem(
      product.id,
      product.name,
      `/dog-food/${product.slug}`,
      {
        description: product.meta_description || `${product.name} by ${product.brand?.name}`,
        image: product.image_url || undefined,
        price: product.price_gbp || undefined,
        rating: product.overall_score || undefined,
      }
    )
  ) || [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background-neutral)]">
      <Header />

      <PageSEO
        title="Dog Food  - Compare & Find the Best Dog Food"
        description={`Browse and compare ${data?.total || 0} science-backed dog food products with detailed nutritional analysis, ratings, and reviews. Find the perfect food for your dog.`}
        canonicalUrl="/dog-food"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Dog Food', url: '/dog-food' },
        ]}
        structuredData={[
          {
            type: 'CollectionPage',
            data: {
              name: 'Dog Food ',
              description: `Browse and compare ${data?.total || 0} science-backed dog food products`,
              url: 'https://onlydogfood.com/dog-food',
              mainEntity: {
                "@type": "ItemList",
                name: 'Dog Food Products',
                description: 'Science-backed dog food products with detailed ratings and reviews',
                numberOfItems: data?.total || 0,
                itemListElement: collectionItems.map((item, index) => ({
                  "@type": "Product",
                  position: index + 1,
                  name: item.name,
                  url: `https://onlydogfood.com${item.url}`,
                  description: item.description,
                  image: item.image,
                  offers: item.price ? {
                    "@type": "Offer",
                    price: item.price,
                    priceCurrency: "GBP",
                  } : undefined,
                  aggregateRating: item.rating ? {
                    "@type": "AggregateRating",
                    ratingValue: item.rating,
                    bestRating: 100,
                  } : undefined,
                })),
              },
            },
          },
        ]}
      />

      <PageHero
        title="Dog Food "
        description={`Browse and compare ${data?.total || 0} science-backed dog food products`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dog Food', href: '/dog-food' },
        ]}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="w-80 flex-shrink-0">
              <div className="rounded-lg border p-6 top-4 bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <h3 className="text-lg font-bold mb-6 text-[var(--color-text-primary)]">Filters</h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Food type</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Foods' },
                      { value: 'dry', label: 'Dry Food' },
                      { value: 'wet', label: 'Wet Food' },
                      { value: 'snack', label: 'Treats & Snacks' },
                    ].map((category) => (
                      <label key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={filters.category === category.value}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Price range</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Prices' },
                      { value: '0-20', label: 'Under £20' },
                      { value: '20-50', label: '£20 - £50' },
                      { value: '50-100', label: '£50 - £100' },
                      { value: '100+', label: 'Over £100' },
                    ].map((range) => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Minimum score</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Scores' },
                      { value: '80', label: '80+ (Excellent)' },
                      { value: '70', label: '70+ (Good)' },
                      { value: '60', label: '60+ (Fair)' },
                    ].map((score) => (
                      <label key={score.value} className="flex items-center">
                        <input
                          type="radio"
                          name="minScore"
                          value={score.value}
                          checked={filters.minScoreFilter === score.value}
                          onChange={(e) => setFilters({ ...filters, minScoreFilter: e.target.value })}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{score.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Popular brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[
                      { value: 'all', label: 'All Brands' },
                      { value: 'royal-canin', label: 'Royal Canin' },
                      { value: 'pedigree', label: 'Pedigree' },
                      { value: 'hill-s', label: 'Hill\'s' },
                      { value: 'purina', label: 'Purina' },
                      { value: 'iams', label: 'Iams' },
                    ].map((brand) => (
                      <label key={brand.value} className="flex items-center">
                        <input
                          type="checkbox"
                          value={brand.value}
                          checked={filters.brands?.includes(brand.value) || false}
                          onChange={(e) => {
                            const currentBrands = filters.brands || [];
                            const newBrands = e.target.checked
                              ? [...currentBrands, brand.value]
                              : currentBrands.filter(b => b !== brand.value);
                            setFilters({ ...filters, brands: newBrands });
                          }}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{brand.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Life Stage Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Life stage</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Life Stages' },
                      { value: 'puppy', label: 'Puppy' },
                      { value: 'adult', label: 'Adult' },
                      { value: 'senior', label: 'Senior' },
                    ].map((stage) => (
                      <label key={stage.value} className="flex items-center">
                        <input
                          type="radio"
                          name="lifeStage"
                          value={stage.value}
                          checked={filters.lifeStage === stage.value}
                          onChange={(e) => setFilters({ ...filters, lifeStage: e.target.value })}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{stage.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Breed Size Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Breed size</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Sizes' },
                      { value: 'small', label: 'Small Breeds' },
                      { value: 'medium', label: 'Medium Breeds' },
                      { value: 'large', label: 'Large Breeds' },
                    ].map((size) => (
                      <label key={size.value} className="flex items-center">
                        <input
                          type="radio"
                          name="breedSize"
                          value={size.value}
                          checked={filters.breedSize === size.value}
                          onChange={(e) => setFilters({ ...filters, breedSize: e.target.value })}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{size.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Diet Filter */}
                <div className="mb-6">
                  <h4 className="font-bold text-[var(--color-text-primary)] mb-3">Special diet</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Diets' },
                      { value: 'grain-free', label: 'Grain Free' },
                      { value: 'hypoallergenic', label: 'Hypoallergenic' },
                      { value: 'organic', label: 'Organic' },
                      { value: 'raw', label: 'Raw' },
                      { value: 'vegetarian', label: 'Vegetarian' },
                    ].map((diet) => (
                      <label key={diet.value} className="flex items-center">
                        <input
                          type="checkbox"
                          value={diet.value}
                          checked={filters.specialDiet?.includes(diet.value) || false}
                          onChange={(e) => {
                            const currentDiets = filters.specialDiet || [];
                            const newDiets = e.target.checked
                              ? [...currentDiets, diet.value]
                              : currentDiets.filter(d => d !== diet.value);
                            setFilters({ ...filters, specialDiet: newDiets });
                          }}
                          className="text-[var(--color-trust)] focus:ring-[var(--color-trust)]"
                        />
                        <span className="ml-2 text-sm text-[var(--color-text-secondary)]">{diet.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    sort: 'score-desc',
                    page: 1,
                    limit: 20,
                    priceRange: 'all',
                    minScoreFilter: 'all',
                    brands: [],
                    lifeStage: 'all',
                    breedSize: 'all',
                    specialDiet: [],
                  })}
                  className="w-full px-4 py-2 text-sm rounded-lg transition-all bg-[var(--color-background-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-background-neutral)] hover:border-[var(--color-trust)]"
                >
                  Clear all filters
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Controls */}
              <div className="rounded-lg border p-4 mb-6 bg-[var(--color-background-card)] border-[var(--color-border)] shadow-[var(--shadow-small)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                      {data?.total || 0} Products Found
                    </h2>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      Page {filters.page || 1} of {Math.ceil((data?.total || 0) / (filters.limit || 20))}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <CustomSelect
                      value={filters.sort || 'score-desc'}
                      onChange={handleSortChange}
                      options={[
                        { value: 'score-desc', label: 'Highest Rated' },
                        { value: 'score-asc', label: 'Lowest Rated' },
                        { value: 'price-asc', label: 'Price: Low to High' },
                        { value: 'price-desc', label: 'Price: High to Low' },
                        { value: 'newest', label: 'Newest' },
                        { value: 'name-asc', label: 'Name A-Z' },
                      ]}
                      className="w-48"
                    />

                    <CustomSelect
                      value={filters.limit?.toString() || '20'}
                      onChange={(value) => setFilters({ ...filters, limit: Number(value), page: 1 })}
                      options={[
                        { value: '10', label: '10 per page' },
                        { value: '20', label: '20 per page' },
                        { value: '50', label: '50 per page' },
                      ]}
                      className="w-36"
                    />

                  </div>
                </div>
              </div>

              {/* Products Display */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-border)] border-t-[var(--color-trust)]"></div>
                </div>
              ) : error && !data ? (
                <div className="text-center py-12">
                  <p className="mb-4 text-[var(--color-caution)]">Error loading products. Please try again.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg transition-all font-bold bg-[var(--color-trust)] text-[var(--color-background-card)] hover:bg-[var(--color-trust-hover)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                  >
                    Retry
                  </button>
                </div>
              ) : !data?.data || data.data.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--color-text-secondary)]">No products found matching your filters.</p>
                </div>
              ) : (
                <>
                  {/* List View */}
                  <LazyLoad fallback={<ProductGridSkeleton count={6} />}>
                    <div className="space-y-4">
                      {data?.data?.map((product) => (
                        <Link
                          key={product.id}
                          href={`/dog-food/${product.slug}`}
                          className="block rounded-lg transition-all duration-200 overflow-hidden bg-[var(--color-background-card)] border border-[var(--color-border)] hover:border-[var(--color-trust)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                        >
                          <div className="flex">
                          {/* Product Image */}
                          <div className="w-32 h-32 flex-shrink-0 relative rounded-lg overflow-hidden bg-[var(--color-background-neutral)]">
                            <Image
                              src={product.image_url || 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z'}
                              alt={product.name}
                              fill
                              className="object-contain p-2"
                              sizes="128px"
                            />

                          </div>

                          {/* Product Details */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {product.sub_category && (() => {
                                  try {
                                    // Try to parse as JSON array
                                    const subCategories = typeof product.sub_category === 'string'
                                      ? JSON.parse(product.sub_category)
                                      : product.sub_category;

                                    if (Array.isArray(subCategories)) {
                                      // Filter and prioritize profile badges
                                      const profileBadges = subCategories.filter(cat =>
                                        ['Natural', 'Hypoallergenic', 'Certified'].includes(cat)
                                      );
                                      const otherBadges = subCategories.filter(cat =>
                                        !['Natural', 'Hypoallergenic', 'Certified'].includes(cat)
                                      );

                                      const displayBadges = [...profileBadges, ...otherBadges].slice(0, 3);

                                      return displayBadges.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {displayBadges.map((cat, idx) => {
                                            const isProfileBadge = ['Natural', 'Hypoallergenic', 'Certified'].includes(cat);
                                            let badgeStyle = {};

                                            if (isProfileBadge) {
                                              switch (cat) {
                                                case 'Natural':
                                                  badgeStyle = {
                                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                                                  };
                                                  break;
                                                case 'Hypoallergenic':
                                                  badgeStyle = {
                                                    background: 'linear-gradient(135deg, #f63bb5 0%, #fc3fc3 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                                                  };
                                                  break;
                                                case 'Certified':
                                                  badgeStyle = {
                                                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
                                                  };
                                                  break;
                                              }
                                            }

                                            return (
                                              <span
                                                key={idx}
                                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                                  isProfileBadge ? 'shadow-sm' : ''
                                                }`}
                                                style={isProfileBadge ? badgeStyle : {
                                                  backgroundColor: '#F3F4F6',
                                                  color: '#374151',
                                                  border: '1px solid #D1D5DB'
                                                }}
                                              >
                                                 {cat}
                                              </span>
                                            );
                                          })}
                                        </div>
                                      ) : null;
                                    }
                                    // If not array, display as single badge
                                    return null;
                                  } catch {
                                    // If parsing fails, don't show anything
                                    return null;
                                  }
                                })()}

                                <h3 className="font-semibold text-lg mb-1 transition-colors text-[var(--color-text-primary)] hover:text-[var(--color-trust)]">
                                  {product.name}
                                </h3>
                                <p className="text-sm mb-2 flex items-center gap-1 text-[var(--color-text-secondary)]">
                                  <span>by {product.brand?.name}</span>
                                  {product.brand?.country_of_origin && (
                                    <span
                                      className="inline-block"
                                      title={product.brand.country_of_origin}
                                      dangerouslySetInnerHTML={{ __html: getCountryFlag(product.brand.country_of_origin) }}
                                    />
                                  )}
                                </p>


                              </div>

                              <div className="text-right ml-4">
                                <div className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">
                                  {product.price_per_kg_gbp ? formatPrice((product.price_per_kg_gbp * 0.15)) : 'Price TBA'}
                                </div>
                                <div className="text-sm text-[var(--color-text-secondary)]">
                                  /per meal
                                </div>
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full text-sm font-bold shadow-[var(--shadow-small)] bg-[var(--color-caution-bg)] text-[var(--color-text-primary)]">
                                  {product.overall_score || 0}/100
                                </div>
                                <span className="text-xs font-medium text-[var(--color-text-secondary)]">ODF score</span>
                              </div>
                              <div className="text-sm font-medium text-[var(--color-trust)]">
                                View details →
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  </LazyLoad>
                  {/* Pagination */}
                  {data && data.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 mt-12">
                      <button
                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                        disabled={(filters.page || 1) <= 1}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--color-background-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-background-neutral)] hover:border-[var(--color-trust)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>

                      <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, (filters.page || 1) - 2) + i;
                          if (pageNum > data.totalPages) return null;

                          const isActive = pageNum === (filters.page || 1);

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-[var(--color-trust)] text-[var(--color-background-card)] border-[var(--color-trust)] shadow-[var(--shadow-medium)]'
                                  : 'bg-[var(--color-background-card)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-neutral)] hover:border-[var(--color-trust)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange((filters.page || 1) + 1)}
                        disabled={(filters.page || 1) >= data.totalPages}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-[var(--color-background-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-background-neutral)] hover:border-[var(--color-trust)] shadow-[var(--shadow-small)] hover:shadow-[var(--shadow-medium)]"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
