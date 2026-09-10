import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TEAMS } from "../data/teams";
import "./HUD.css";

export function HUD() {
  const {
    leftGoals,
    rightGoals,
    leftTeamCode,
    rightTeamCode,
    isAiming,
    aimPower,
    showGoalFlash,
    setShowGoalFlash,
    resetBall,
    resetScore,
  } = useAppStore();

  const [goalFlashVisible, setGoalFlashVisible] = useState(false);

  const leftTeam = TEAMS.find((t) => t.code === leftTeamCode);
  const rightTeam = TEAMS.find((t) => t.code === rightTeamCode);

  useEffect(() => {
    if (showGoalFlash) {
      setGoalFlashVisible(true);
      setShowGoalFlash(false);
      const timer = setTimeout(() => {
        setGoalFlashVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showGoalFlash, setShowGoalFlash]);

  return (
    <div className="hud-overlay">
      {/* Score display */}
      <div className="hud-score">
        <div className="score-team left-team">
          {leftTeam && (
            <div
              className="team-badge-small"
              style={{
                background: `linear-gradient(to bottom, ${leftTeam.colors[0]} 50%, ${leftTeam.colors[1]} 50%)`,
              }}
            >
              <span className="badge-code">{leftTeam.code}</span>
            </div>
          )}
          <div className="team-name">{leftTeam?.name || "Left Team"}</div>
          <div className="score-value">{leftGoals}</div>
        </div>
        <div className="score-divider">vs</div>
        <div className="score-team right-team">
          {rightTeam && (
            <div
              className="team-badge-small"
              style={{
                background: `linear-gradient(to bottom, ${rightTeam.colors[0]} 50%, ${rightTeam.colors[1]} 50%)`,
              }}
            >
              <span className="badge-code">{rightTeam.code}</span>
            </div>
          )}
          <div className="team-name">{rightTeam?.name || "Right Team"}</div>
          <div className="score-value">{rightGoals}</div>
        </div>
      </div>

      {/* Goal flash */}
      {goalFlashVisible && (
        <div className="goal-flash">
          <div className="goal-text">GOAL!</div>
        </div>
      )}

      {/* Aiming indicator */}
      {isAiming && (
        <div className="aim-indicator">
          <div className="aim-bar">
            <div
              className="aim-power"
              style={{ width: `${aimPower * 100}%` }}
            />
          </div>
          <div className="aim-label">Power: {Math.round(aimPower * 100)}%</div>
        </div>
      )}

      {/* Instructions */}
      <div className="hud-instructions">
        <p>Drag ball to aim · Space to kick</p>
        <p>Arrow keys for keyboard control</p>
      </div>

      {/* Control buttons */}
      <div className="hud-controls">
        <button onClick={resetBall} className="control-btn reset-btn">
          Reset Ball
        </button>
        <button onClick={resetScore} className="control-btn score-btn">
          Reset Score
        </button>
      </div>
    </div>
  );
}
