import { Router, Route } from '@solidjs/router';
import Home from './Home.jsx';
import AMSTAR2Checklist from './routes/AMSTAR2Checklist.jsx';
import ProjectDashboard from './routes/ProjectDashboard.jsx';
import AppDashboard from './AppDashboard.jsx';
import SignIn from './auth/SignIn.jsx';
import SignUp from './auth/SignUp.jsx';
import VerifyEmail from './auth/VerifyEmail.jsx';
import ResetPassword from './auth/ResetPassword.jsx';
import App from './App.jsx';

export default function AppRoutes() {
  return (
    <Router base={'/amstar2-checklist-scoring-app'}>
      <Route path="/" component={Home} />
      <Route path="/" component={App}>
        <Route path="/dashboard" component={AppDashboard} />
        {/* <Route path="/project/new" component={CreateProject} /> */}
        <Route path="/project/:id" component={ProjectDashboard} />
        <Route path="/checklist/:id" component={AMSTAR2Checklist} />
        {/* <Route path="/checklist/compare/:idA/:idB" component={ChecklistCompare} /> */}
      </Route>
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/reset-password" component={ResetPassword} />
    </Router>
  );
}
