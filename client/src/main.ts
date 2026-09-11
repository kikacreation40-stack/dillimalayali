import './style.css';
import { Game } from './game/Game';

try {
  new Game(document.querySelector<HTMLCanvasElement>('#world')!);
} catch (error) {
  console.error(error);
  document.querySelector('#error')!.classList.remove('hidden');
}
