import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { AppModal } from './components/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, AppModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('library-tracker');
}