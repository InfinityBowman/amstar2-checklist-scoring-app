import { Router, Route } from '@solidjs/router';
import { Show } from 'solid-js';
import Home from './Home.jsx';
import AMSTAR2Checklist from './AMSTAR2Checklist.jsx';
import ProjectDashboard from './ProjectDashboard.jsx';
import AppDashboard from './AppDashboard.jsx';
import SignIn from '../auth/SignIn.jsx';
import SignUp from '../auth/SignUp.jsx';
import VerifyEmail from '../auth/VerifyEmail.jsx';
import ResetPassword from '../auth/ResetPassword.jsx';
import App from '../App.jsx';
import useOnlineStatus from '../primatives/useOnlineStatus';

export const BASEPATH = '/amstar2-checklist-scoring-app';

export default function AppRoutes() {
  return (
    <Router base={BASEPATH}>
      <Route path="/" component={App}>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={AppDashboard} />
        {/* <Route path="/project/new" component={CreateProject} /> */}
        <Route path="/project/:name/:index" component={ProjectDashboard}></Route>
        <Route path="/checklist/:id" component={AMSTAR2Checklist} />
        {/* <Route path="/checklist/compare/name+index and name+index in query params" component={ChecklistCompare} /> */}""
        <Route
          path="/signin"
          component={() => (
            <OnlineGuard>
              <SignIn />
            </OnlineGuard>
          )}
        />
        <Route path="/signup" component={SignUp} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/reset-password" component={ResetPassword} />
      </Route>
    </Router>
  );
}

function OnlineGuard(props) {
  const online = useOnlineStatus();
  // createEffect(() => {
  //   console.log('Online status changed:', online());
  // });
  return (
    <Show when={online()} fallback={<div>You must be online to access this page.</div>}>
      {props.children}
    </Show>
  );
}
