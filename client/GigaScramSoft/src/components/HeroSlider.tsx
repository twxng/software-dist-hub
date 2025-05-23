import React from "react";
import "../styles/components/HeroSlider.css";

const slides = [
  {
    image:
      "https://images-eds-ssl.xboxlive.com/image?url=7flt5HU26ZSS3Tgted_TMty0wzqMQYpm03yD7eAPRtQBYO5dMlD18uZxNDuKXvpqFad7pNDWWkh3T2oYTciVgzHmuZ4YEFaFGLFczapJfidxMGF_iiZNfQF56AtqHvJL_iyGQOIsYmUP0lc9pxSYWf9QMAHsPYKnmhqhAJqouH4fiITNF5Mc4swlHOxdCMK06RaUc6CwIr_fHn4WGmvwcg--&h=576",
    title: "DOOM: The Dark Ages",
    description: "Become the Slayer in a medieval war against Hell. Play now.",
    button: { text: "Get", link: "/categories" },
  },
  {
    image:
      "https://wallpapercave.com/wp/wp4999151.jpg",
    title: "The Witcher 3: Wild Hunt",
    description: "One of the most acclaimed RPGs of all time Now ready for a new generation...",
    button: { text: "Read more", link: "/sales" },
  },
  {
    image:
      "https://wallpapercave.com/wp/wp14608311.png",
    title: "Top Wishlisted (30 days)",
    description: "Check out the top list of the most popular games of the decade.",
    button: { text: "Read more", link: "/new" },
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slider">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`hero-slide${idx === current ? " active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-slide-content">
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
            <a className="hero-slide-btn" href={slide.button.link}>
              {slide.button.text}
            </a>
          </div>
        </div>
      ))}
      <div className="hero-slider-dots">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={idx === current ? "active" : ""}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider; 