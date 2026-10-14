/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaceProvider } from './context/PaceContext';
import { Header } from './components/layout/Header';
import { BottomNav, NavigationTab } from './components/layout/BottomNav';

import { DashboardView } from './components/dashboard/DashboardView';
import { MissionsView } from './components/missions/MissionsView';
import { PerformanceView } from './components/performance/PerformanceView';
import { StudyView } from './components/study/StudyView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';

import { InAppAlertBanner } from './components/notifications/InAppAlertBanner';
import { usePace } from './context/PaceContext';
import { MissionModal } from './components/modals/MissionModal';
import { TrainingModal } from './components/modals/TrainingModal';
import { StudyModal } from './components/modals/StudyModal';
import { CalendarEventModal } from './components/modals/CalendarEventModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

import { Mission, CalendarActivityType } from './types';

function MainApp() {
  const { currentUser, isGuest, loading } = useAuth();
  const { activeAlerts, dismissAlert } = usePace();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  const [trainingModalOpen, setTrainingModalOpen] = useState(false);

  const [studyModalOpen, setStudyModalOpen] = useState(false);
  const [studyPresetSubject, setStudyPresetSubject] = useState<string | undefined>();

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarPresetDate, setCalendarPresetDate] = useState<string | undefined>();
  const [calendarPresetType, setCalendarPresetType] = useState<CalendarActivityType | undefined>();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // If initial load and no session or guest mode set, show onboarding
  const hasOnboarded =
    localStorage.getItem('pace20_has_onboarded') === 'true' ||
    Boolean(currentUser) ||
    isGuest;

  const [showFirstOnboarding, setShowFirstOnboarding] = useState(!hasOnboarded);

  const handleFinishOnboarding = () => {
    localStorage.setItem('pace20_has_onboarded', 'true');
    setShowFirstOnboarding(false);
  };

  const handleOpenEditMission = (mission: Mission) => {
    setEditingMission(mission);
    setMissionModalOpen(true);
  };

  const handleOpenNewMission = () => {
    setEditingMission(null);
    setMissionModalOpen(true);
  };

  const handleOpenNewEvent = (presetDate?: string, presetType?: CalendarActivityType) => {
    setCalendarPresetDate(presetDate);
    setCalendarPresetType(presetType);
    setCalendarModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070709] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-700">
            <span className="font-black text-xl text-[#ccff00] animate-pulse">P</span>
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">
            Initializing PACE 2.0 Command
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col antialiased selection:bg-[#ccff00] selection:text-black">
      {/* Top Header */}
      <Header
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
      />

      {/* Responsive Navigation Tabs */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Command View Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenNewMission={handleOpenNewMission}
            onOpenNewTraining={() => setTrainingModalOpen(true)}
            onOpenNewStudy={() => setStudyModalOpen(true)}
            onOpenNewEvent={() => handleOpenNewEvent()}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsView
            onOpenCreateMission={handleOpenNewMission}
            onEditMission={handleOpenEditMission}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceView onOpenNewTraining={() => setTrainingModalOpen(true)} />
        )}

        {activeTab === 'study' && (
          <StudyView
            onOpenNewStudy={() => {
              setStudyPresetSubject(undefined);
              setStudyModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView onOpenNewEvent={handleOpenNewEvent} />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Floating In-App Alert Notifications for Synced Training & Deadlines */}
      <InAppAlertBanner
        alerts={activeAlerts}
        onDismiss={dismissAlert}
        onNavigateToCalendar={() => setActiveTab('calendar')}
      />

      {/* Modals & Drawers */}
      <MissionModal
        isOpen={missionModalOpen}
        onClose={() => {
          setMissionModalOpen(false);
          setEditingMission(null);
        }}
        initialData={editingMission}
      />

      <TrainingModal
        isOpen={trainingModalOpen}
        onClose={() => setTrainingModalOpen(false)}
      />

      <StudyModal
        isOpen={studyModalOpen}
        onClose={() => setStudyModalOpen(false)}
        presetSubjectName={studyPresetSubject}
      />

      <CalendarEventModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        presetDate={calendarPresetDate}
        presetType={calendarPresetType}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenAuth={() => setOnboardingOpen(true)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigateTab={setActiveTab}
      />

      <OnboardingModal
        isOpen={showFirstOnboarding || onboardingOpen}
        onClose={() => {
          handleFinishOnboarding();
          setOnboardingOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaceProvider>
        <MainApp />
      </PaceProvider>
    </AuthProvider>
  );
}
