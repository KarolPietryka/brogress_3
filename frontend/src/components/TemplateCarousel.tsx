import { useEffect, useRef } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { WorkoutTemplate } from "../data/templates";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

type Props = {
  templates: WorkoutTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (t: WorkoutTemplate) => void;
};

export function TemplateCarousel({
  templates,
  activeTemplateId,
  onSelectTemplate,
}: Props) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const activeIdRef = useRef(activeTemplateId);
  activeIdRef.current = activeTemplateId;

  const initialIndex = Math.max(
    0,
    templates.findIndex((t) => t.id === activeTemplateId),
  );

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const idx = templates.findIndex((t) => t.id === activeTemplateId);
    if (idx >= 0 && swiper.activeIndex !== idx) {
      swiper.slideTo(idx);
    }
  }, [activeTemplateId, templates]);

  return (
    <div
      className="template-swiper-wrap"
      role="region"
      aria-label="Workout template carousel"
    >
      <Swiper
        className="template-swiper"
        modules={[EffectCoverflow, Navigation]}
        effect="coverflow"
        centeredSlides
        slidesPerView="auto"
        spaceBetween={20}
        grabCursor
        slideToClickedSlide
        navigation
        rewind
        initialSlide={initialIndex}
        speed={380}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 160,
          modifier: 1,
          slideShadows: false,
        }}
        onSwiper={(instance) => {
          swiperRef.current = instance;
        }}
        onSlideChange={(instance) => {
          const t = templates[instance.activeIndex];
          if (!t || t.id === activeIdRef.current) return;
          onSelectTemplate(t);
        }}
      >
        {templates.map((t) => (
          <SwiperSlide key={t.id}>
            <button
              type="button"
              className={`choice choice--carousel ${
                activeTemplateId === t.id ? "selected" : ""
              }`}
            >
              <div className="choice-title">{t.label}</div>
              <div className="choice-sub">
                {t.exercises.length}{" "}
                {t.exercises.length === 1 ? "exercise" : "exercises"}
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
