import { Router, Route } from '@solidjs/router';
import { Show } from 'solid-js';
import Home from './Home.jsx';
import AMSTAR2Checklist from './AMSTAR2Checklist.jsx';
import ProjectDashboard from './ProjectDashboard.jsx';
import AppDashboard from './AppDashboard.jsx';
import SignIn from '@auth/SignIn.jsx';
import SignUp from '@auth/SignUp.jsx';
import VerifyEmail from '@auth/VerifyEmail.jsx';
import ResetPassword from '@auth/ResetPassword.jsx';
import App from '../App.jsx';
import NotFound from './NotFound.jsx';
import Offline from './Offline.jsx';
import useOnlineStatus from '@primitives/useOnlineStatus.js';
import AMSTAR2Merge from './AMSTAR2Merge.jsx';
import DataViewer from '@/components/DataViewer.jsx';

export const BASEPATH = '/amstar2-checklist-scoring-app';

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AppRoutes() {
  return (
    <Router base={BASEPATH}>
      <Route path="/" component={App}>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={AppDashboard} />
        <Route path="/dataviewer" component={DataViewer} />
        {/* <Route path="/project/new" component={CreateProject} /> */}
        <Route path="/projects/:projectId" component={ProjectDashboard} />
        <Route path="/projects/:projectId/reviews/:reviewId/checklists/:checklistId" component={AMSTAR2Checklist} />
        <Route path="/checklist/:checklistId" component={AMSTAR2Checklist} />
        <Route path="/merge/:checklistIdA/:checklistIdB" component={AMSTAR2Merge} />
        <Route
          path="/signin"
          component={() => (
            <OnlineGuard>
              <SignIn />
            </OnlineGuard>
          )}
        />
        <Route
          path="/signup"
          component={() => (
            <OnlineGuard>
              <SignUp />
            </OnlineGuard>
          )}
        />
        <Route
          path="/verify-email"
          component={() => (
            <OnlineGuard>
              <VerifyEmail />
            </OnlineGuard>
          )}
        />
        <Route
          path="/reset-password"
          component={() => (
            <OnlineGuard>
              <ResetPassword />
            </OnlineGuard>
          )}
        />
        <Route path="*" component={NotFound} />
      </Route>
    </Router>
  );
}

function OnlineGuard(props) {
  const online = useOnlineStatus();
  return (
    <Show when={online()} fallback={<Offline />}>
      {props.children}
    </Show>
  );
}
