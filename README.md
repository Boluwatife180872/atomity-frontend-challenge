# Cloud Cost Explorer | Atomity Frontend Challenge

An interactive multilevel cloud cost telemetry/resource drill down explorer built with next.js , tailwind, and framer motion

## Overview & Feature Chosen
I opted to build the Cloud Cost Explorer & Scroll-Driven Storytelling feature. The reasoning was that something a bit less dry than a standard dashboard would be nice for this project. By turning the exploration of costs by cluster into a scroll driven multi-tiered story (cluster -> namespaces -> pods -> resources) I was able to make something quite engaging.

## Approach to Animation
Animations broadly speaking are driven by scroll progress through to story chapters. This was achieved with the help of some excellent tools. Using Framer's `useTransform` and layout based animations I was able to create nice bar splits, fan-outs, accordions, and table transitions as the user interacts with the story chapter or jumps between them using the chapter dot scroller.

## Token & Style Structure
Colors are structured as css variables within `globals.css` for light and dark mode (Muted Sand & Eucalytpus theme) and tailwind config makes those available as tokens so that components don't need to hard-code any styles.

## Data Fetching & Caching
The `@tanstack/react-query` `useQuery` hook is used throughout for data fetching and caching. This provides excellent out of the box caching, refetching, and loading/error state management. The query data is pulled from the local api route (`/api/dashboard`).

## Libraries Used & Why
Next.js (App Router): For speed, ssr, and API routes
Tailwind: For rapid, consistent, responsive design
Framer Motion: While I don't have a ton of experience with it, I knew from prior projects that it was an excellent choice for this type of project and I wanted to have an excuse to work with it
TanStack React Query: For excellent async state management

## Tradeoffs & Decisions
useTransform & Scroll Bindings : When it came to tradeoffs and decisions I've made in the code, I decided to go with `useTransform`, and state binding approach, rather than trying to animate based on requestAnimationFrame. This has caused some rubber banding issues on mobile when rapidly scrolling, but I've mitigated that with good rAF optimizations in the layout, and by throttling updates to the scroll progress state.

## What I Would Improve With More Time
Better Understanding of Framer Motion & Animations : With more time I would spend some time really understanding how Framer Motion works under the hood, and do a better job with optimizing animations for this particular project, making sure scroll performance is buttery smooth on mobile, and experiment with more interesting layout projections.