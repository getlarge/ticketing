# NestJS Challenges

The [ticketing repository](https://github.com/getlarge/ticketing) contains challenges to help you learn NestJS by practicing. The challenges are designed to help you understand the principles of NestJS and how to apply them in a real-world scenario.

- [Chapter 1: Introduction to NestJS](./exercises/1-introduction-to-nestjs/README.md)
- [Chapter 2: Design and implement a hybrid application](./exercises/2-design-and-implement-a-hybrid-application/README.md)
- [Chapter 3: Advanced techniques](./exercises/3-advanced-techniques/README.md)

## Exercises organization

```mermaid
%%{init: { 'logLevel': 'debug', 'theme': 'base', 'gitGraph': {'rotateCommitLabel': true}} }%%

---
title: Managing exercises branches
---
gitGraph LR:
  commit id: "feat: great new feature"
  branch nestjs-workshop-phase-1-chapter-1
  checkout nestjs-workshop-phase-1-chapter-1
  commit id: "feat: create a new project"
  branch nestjs-workshop-phase-1-chapter-2
  checkout nestjs-workshop-phase-1-chapter-2
  commit id: "feat: create a config module"
  branch nestjs-workshop-phase-1-chapter-3
  checkout nestjs-workshop-phase-1-chapter-3
  commit id: "feat: implement lifecycle hooks"
  branch nestjs-workshop-phase-1-chapter-4
  checkout nestjs-workshop-phase-1-chapter-4
  commit id: "feat: showcase request lifecycle"
  branch nestjs-workshop-phase-1-chapter-5
  checkout nestjs-workshop-phase-1-chapter-5
  commit id: "feat: use request context hooks"
  checkout main
  commit id: "chore: update NestJS"
  commit tag: "v1.0.0"
  checkout nestjs-workshop-phase-1-chapter-1
  merge main
  checkout nestjs-workshop-phase-1-chapter-2
  merge nestjs-workshop-phase-1-chapter-1
  checkout nestjs-workshop-phase-1-chapter-3
  merge nestjs-workshop-phase-1-chapter-2
  checkout nestjs-workshop-phase-1-chapter-4
  merge nestjs-workshop-phase-1-chapter-3
  checkout nestjs-workshop-phase-1-chapter-5
  merge nestjs-workshop-phase-1-chapter-4
  checkout main

```

> [!IMPORTANT]
> The exercises are organized in chapters. Each chapter contains a set of exercises that build on top of each other. To resolve an exercise, create a new branch and submit a PR with the solution.
