import { useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { TEAMS } from "../data/teams";
import "./TeamSelect.css";

/**
 * Team selection carousel UI component.
 * Allows users to select Left Team and Right Team from available teams.
 * Displays as a horizontal carousel/grid of team badges.
 */
export function TeamSelect() {
  const { leftTeamCode, rightTeamCode, setLeftTeamCode, setRightTeamCode } =
    useAppStore();
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleTeamSelect = (teamCode: string) => {
    if (selectedSide === "left") {
      setLeftTeamCode(teamCode);
      setSelectedSide(null);
    } else if (selectedSide === "right") {
      setRightTeamCode(teamCode);
      setSelectedSide(null);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const leftTeam = TEAMS.find((t) => t.code === leftTeamCode);
  const rightTeam = TEAMS.find((t) => t.code === rightTeamCode);

  return (
    <div className="team-select-overlay">
      {/* Backdrop when carousel is open */}
      {selectedSide && (
        <div
          className="team-select-backdrop"
          onClick={() => setSelectedSide(null)}
        />
      )}

      {/* Team selection controls */}
      <div className="team-select-header">
        <div
          className={`team-selector left-selector ${
            selectedSide === "left" ? "active" : ""
          }`}
          onClick={() => setSelectedSide(selectedSide === "left" ? null : "left")}
        >
          <div className="team-badge-container">
            {leftTeam && (
              <div
                className="team-badge-mini"
                style={{
                  background: `linear-gradient(to bottom, ${leftTeam.colors[0]} 50%, ${leftTeam.colors[1]} 50%)`,
                }}
              >
                <span className="team-code">{leftTeam.code}</span>
              </div>
            )}
          </div>
          <div className="team-name-small">{leftTeam?.name || "Select"}</div>
          <div className="change-btn">Change</div>
        </div>

        <div className="vs-text">vs</div>

        <div
          className={`team-selector right-selector ${
            selectedSide === "right" ? "active" : ""
          }`}
          onClick={() =>
            setSelectedSide(selectedSide === "right" ? null : "right")
          }
        >
          <div className="team-badge-container">
            {rightTeam && (
              <div
                className="team-badge-mini"
                style={{
                  background: `linear-gradient(to bottom, ${rightTeam.colors[0]} 50%, ${rightTeam.colors[1]} 50%)`,
                }}
              >
                <span className="team-code">{rightTeam.code}</span>
              </div>
            )}
          </div>
          <div className="team-name-small">{rightTeam?.name || "Select"}</div>
          <div className="change-btn">Change</div>
        </div>
      </div>

      {/* Carousel panel when a team side is selected */}
      {selectedSide && (
        <div className="team-select-carousel-panel">
          <div className="carousel-header">
            <h3>
              Select {selectedSide === "left" ? "Left" : "Right"} Team
            </h3>
            <button
              className="close-btn"
              onClick={() => setSelectedSide(null)}
            >
              ✕
            </button>
          </div>

          <div className="carousel-container">
            <button
              className="carousel-scroll-btn left"
              onClick={() => scroll("left")}
            >
              ‹
            </button>

            <div className="team-carousel" ref={carouselRef}>
              {TEAMS.map((team) => (
                <div
                  key={team.code}
                  className={`team-badge-large ${
                    (selectedSide === "left" && team.code === leftTeamCode) ||
                    (selectedSide === "right" && team.code === rightTeamCode)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleTeamSelect(team.code)}
                >
                  <div
                    className="badge-circle"
                    style={{
                      background: `linear-gradient(to bottom, ${team.colors[0]} 50%, ${team.colors[1]} 50%)`,
                    }}
                  >
                    <span className="badge-code">{team.code}</span>
                  </div>
                  <div className="badge-label">{team.name}</div>
                </div>
              ))}
            </div>

            <button
              className="carousel-scroll-btn right"
              onClick={() => scroll("right")}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
