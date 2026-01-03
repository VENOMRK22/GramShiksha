import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Landing from './pages/Landing';
import CreateProfile from './pages/CreateProfile';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';

import LevelPlayer from './pages/LevelPlayer';
import SyncPage from './pages/SyncPage';
import Settings from './pages/Settings';

import TeacherDashboard from './pages/teacher/Dashboard';
import ContentEditor from './pages/teacher/ContentEditor';
import ClassView from './pages/teacher/ClassView';
import SubjectView from './pages/teacher/SubjectView';
import ModuleView from './pages/teacher/ModuleView';

// New Pages

// New Pages
import LearnPage from './pages/LearnPage';
import HomeworkPage from './pages/HomeworkPage';
import AchievementsPage from './pages/AchievementsPage';
import VillageLeaderboard from './pages/VillageLeaderboard';
import Leaderboard from './components/game/Leaderboard';
import AttendancePage from './pages/AttendancePage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/" replace />;
    return <>{children}</>;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppShell />,
        children: [
            {
                index: true,
                element: <Landing />
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'play/:levelId',
                element: (
                    <ProtectedRoute>
                        <LevelPlayer />
                    </ProtectedRoute>
                )
            },
            {
                path: 'sync',
                element: (
                    <ProtectedRoute>
                        <SyncPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                )
            },
            // New UI Routes
            {
                path: 'learn',
                element: (
                    <ProtectedRoute>
                        <LearnPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'learn/:subjectId',
                element: (
                    <ProtectedRoute>
                        <LearnPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'homework',
                element: (
                    <ProtectedRoute>
                        <HomeworkPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'achievements',
                element: (
                    <ProtectedRoute>
                        <AchievementsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'village',
                element: (
                    <ProtectedRoute>
                        <VillageLeaderboard />
                    </ProtectedRoute>
                )
            },
            {
                path: 'leaderboard',
                element: (
                    <ProtectedRoute>
                        <div className="p-6 pb-24 space-y-6">
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                                Class Leaderboard
                            </h1>
                            <Leaderboard />
                        </div>
                    </ProtectedRoute>
                )
            }
        ]
    },
    {
        path: 'attendance',
        element: (
            <ProtectedRoute>
                <AttendancePage />
            </ProtectedRoute>
        )
    },
    {
        path: '/create-profile',
        element: <CreateProfile />
    },
    {
        path: '/teacher',
        element: (
            <ProtectedRoute>
                <TeacherDashboard />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/create',
        element: (
            <ProtectedRoute>
                <ContentEditor />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/class/:classId',
        element: (
            <ProtectedRoute>
                <ClassView />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/subject/:subjectId',
        element: (
            <ProtectedRoute>
                <SubjectView />
            </ProtectedRoute>
        )
    },
    {
        path: '/teacher/module/:moduleId',
        element: (
            <ProtectedRoute>
                <ModuleView />
            </ProtectedRoute>
        )
    }
]);
