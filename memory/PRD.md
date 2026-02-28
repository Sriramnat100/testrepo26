# Cat Inspect AI - Product Requirements Document

## Original Problem Statement
Build a production-quality web app UI called "Cat Inspect AI", an AI-powered inspection platform for Caterpillar equipment inspectors. Primary user: a field inspector who needs to do inspections fast, safely, and with minimal manual paperwork.

## User Persona
- **Primary User**: Field Inspector (e.g., "Sriram N.")
- **Context**: Working in the field with Caterpillar equipment
- **Needs**: Fast inspections, safety prioritization, minimal paperwork, low cognitive load
- **Device Usage**: Desktop/laptop, tablet (touch-optimized)

## Core Requirements (Static)
1. Dashboard with previous inspections table, AI chatbot, and analytics
2. New Inspection wizard (3-step: Equipment, Type, Review)
3. Live Inspection page with real-time camera feed and AI-powered findings
4. Inspection Detail page with tabs (Summary, Checklist, Media, Parts, Connect)
5. Status badges: PASS, FAIL, MONITOR, Draft, In Progress, Submitted
6. OpenAI-powered chatbot for inspection data analysis

## What's Been Implemented (Jan 28, 2026)

### Backend (FastAPI)
- ✅ REST API with /api prefix
- ✅ GET /api/inspections - List inspections with search/filter
- ✅ GET /api/inspections/{id} - Get inspection detail
- ✅ POST /api/inspections - Create new inspection
- ✅ PUT /api/inspections/{id}/checklist/{item_id} - Update checklist item
- ✅ POST /api/inspections/{id}/finish - Finish inspection
- ✅ GET /api/analytics - Get analytics data
- ✅ POST /api/chat - AI chatbot endpoint (OpenAI GPT-5.2)
- ✅ Mock data for inspections and analytics

### Frontend (React + Tailwind + Shadcn UI)
- ✅ Dashboard (/app/dashboard)
  - Inspections table with search, filters, export
  - Analytics cards (Failed Parts, Inspections Over Time, Pass/Fail/Monitor)
  - AI Chatbot widget with suggested prompts
  - New Inspection FAB
- ✅ New Inspection (/app/inspections/new)
  - 3-step wizard (Equipment, Type, Review)
  - Summary card with live updates
- ✅ Live Inspection (/app/inspections/:id/live)
  - WebRTC camera integration
  - Live Findings timeline
  - Control bar (Record, Capture, Voice, Identify Part)
  - Quick mark buttons (PASS/FAIL/MONITOR)
  - Simulated AI findings detection
- ✅ Inspection Detail (/app/inspections/:id)
  - 5 tabs: Summary, Checklist, Media, Parts, Connect
  - Editable checklist items
  - Regenerate report, Share functionality

### Components
- StatusBadge, SeverityBadge
- InspectionTable, ChatDock
- LiveFindingsTimeline, AnalyticsCards
- InspectionWizard, MediaGallery
- PartsMatchList, ConnectClusters
- TopBar, Layout

## Prioritized Backlog

### P0 - Critical (MVP Complete)
- ✅ All routes functional
- ✅ Inspections CRUD
- ✅ AI chatbot integration
- ✅ Live inspection with camera

### P1 - High Priority (Next Phase)
- [ ] User authentication (currently skipped per user request)
- [ ] Persist inspection data to MongoDB
- [ ] Real AI-powered image analysis for findings detection
- [ ] Voice note transcription with Whisper

### P2 - Medium Priority
- [ ] Export to PDF functionality
- [ ] Offline support for field use
- [ ] Push notifications for safety alerts
- [ ] Multi-language support

### P3 - Nice to Have
- [ ] Custom inspection templates
- [ ] Fleet management integration
- [ ] Predictive maintenance analytics
- [ ] Mobile app (React Native)

## Technical Stack
- Frontend: React 19, Tailwind CSS, Shadcn UI, Recharts
- Backend: FastAPI, Python 3.x
- Database: MongoDB (mock data currently)
- AI: OpenAI GPT-5.2 via Emergent LLM Key
- Camera: WebRTC (navigator.mediaDevices)

## Next Tasks
1. Add real MongoDB persistence for inspections
2. Implement actual AI image analysis for live findings
3. Add authentication if needed
4. Export reports to PDF
