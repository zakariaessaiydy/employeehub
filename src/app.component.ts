import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { NotificationService } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import { Employee, Project, Reward } from './models';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { RewardsComponent } from './components/rewards/rewards.component';
import { ProfileComponent } from './components/profile/profile.component';
import { KudosModalComponent } from './components/kudos-modal/kudos-modal.component';
import { NotificationComponent } from './components/notification/notification.component';
import { ConfettiComponent } from './components/confetti/confetti.component';

type View = 'dashboard' | 'employees' | 'projects' | 'rewards' | 'profile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    EmployeesComponent,
    ProjectsComponent,
    RewardsComponent,
    ProfileComponent,
    KudosModalComponent,
    NotificationComponent,
    ConfettiComponent,
  ],
})
export class AppComponent {
  dataService = inject(DataService);
  notificationService = inject(NotificationService);
  themeService = inject(ThemeService); // Initialize theme service

  currentUser = this.dataService.currentUser;
  notifications = this.notificationService.notifications;
  
  activeView = signal<View>('dashboard');

  kudosTargetEmployee = signal<Employee | null>(null);
  
  kudosBalanceUpdated = signal(false);
  kudosPointsUpdated = signal(false);
  showConfetti = signal(false);


  changeView(view: View) {
    this.activeView.set(view);
  }

  openKudosModal(employee: Employee) {
    this.kudosTargetEmployee.set(employee);
  }

  closeKudosModal() {
    this.kudosTargetEmployee.set(null);
  }

  handleSendKudos(event: { to: Employee, amount: number, message: string }) {
    const result = this.dataService.sendKudos(event.to.id, event.amount, event.message);
    if (result.success) {
      this.notificationService.show(result.message, 'success');
      this.closeKudosModal();
      this.triggerBalanceAnimation();
      if (event.amount >= 50) { // Significant amount for confetti
        this.triggerConfetti();
      }
    } else {
      this.notificationService.show(result.message, 'error');
    }
  }

  handleRedeemReward(reward: Reward) {
    const result = this.dataService.redeemReward(reward.id);
     if (result.success) {
      this.notificationService.show(result.message, 'success');
      this.triggerPointsAnimation();
    } else {
      this.notificationService.show(result.message, 'error');
    }
  }

  triggerBalanceAnimation() {
    this.kudosBalanceUpdated.set(true);
    setTimeout(() => this.kudosBalanceUpdated.set(false), 500);
  }

  triggerPointsAnimation() {
    this.kudosPointsUpdated.set(true);
    setTimeout(() => this.kudosPointsUpdated.set(false), 500);
  }
  
  triggerConfetti() {
    this.showConfetti.set(true);
    setTimeout(() => this.showConfetti.set(false), 3000); // Corresponds to animation duration
  }

  getIcon(view: View): string {
    switch(view) {
      case 'dashboard': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`;
      case 'employees': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197m0 0A4 4 0 1112 4.354m0 0v5.292" /></svg>`;
      case 'projects': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`;
      case 'rewards': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM6 8c1.657 0 3-1.343 3-3S7.657 2 6 2 3 3.343 3 5s1.343 3 3 3zm12 14c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" /></svg>`;
      case 'profile': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`;
      default: return '';
    }
  }
}