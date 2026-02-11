"use client";

import { useEffect } from "react";

// @ts-ignore
declare const Splide: any;

export default function ExploreWorkflows() {
  useEffect(() => {
    const initSplide = () => {
      if (typeof Splide === "undefined") return;

      document.querySelectorAll(".slider2").forEach((slider) => {
        new Splide(slider, {
          perPage: 3,
          perMove: 1,
          focus: "center",
          type: "loop",
          gap: "2em",
          arrows: false,
          pagination: false,
          speed: 800,
          dragAngleThreshold: 80,
          rewind: false,
          waitForTransition: false,
          updateOnMove: true,
          trimSpace: false,
          breakpoints: {
            991: { perPage: 3, gap: "4vw" },
            767: { perPage: 1, gap: "4vw" },
            479: { perPage: 1, gap: "1vw" },
          },
        }).mount();
      });
    };

    if (typeof Splide !== "undefined") {
      initSplide();
    } else {
      const interval = setInterval(() => {
        if (typeof Splide !== "undefined") {
          clearInterval(interval);
          initSplide();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <section className="section_workflows-slider">
      <div className="padding-global">
        <div className="simple-container">
          <div className="padding-section-large is-workflows">
            <div className="layout_left-align">
              <div className="workflows-header-wrppaer">
                <h2 className="heading-style-xl">Explore Our Workflows</h2>
                <p className="paragraph-line-height-1-15">
                  From multi-layer compositing to matte manipulation, Weavy
                  keeps up with your creativity with all the editing tools you
                  recognize and rely on.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="splide slider2 tall">
                <div className="splide__track">
                  <div className="splide__list">
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Multiple Models</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc15e_Workflow%2001.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/dIjHiwG4WWVtodBraoA2"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards is-active">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Wan LoRa Inflate</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif"
                            alt=""
                            sizes="(max-width: 991px) 100vw, 926.0999755859375px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc164_Workflow%2003.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/flow/ajkQsnEdST1Y9ymyTYaZ"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">
                            ControlNet - Structure Reference
                          </h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc16a_Workflow%2002.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/lmQ3o3xBQw336nCQx6ee"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">
                            Camera Angle Control
                          </h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/681f925d9ecbfaf69c5dc170_Workflow%2004.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/RnmpwkU1BWvR1d2xvDXS"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Relight 2.0 human</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac314fefe464791808_Relight%202.0%20human.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/YPXM99M6Wujufa0tNgXc"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Weavy Logo</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acdb693fa2102f0af2_Weavy%20Logo.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/XvULalxaRR01K0RA1T0Kqx?view=workflow"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Relight - Product</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0ac04c55a803826a6e5_Relight%20-%20Product.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/oOuwYBIffBhSc2PKxJWL"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="splide__slide three-cards">
                      <div className="slider-tall center">
                        <div className="text-opacity">
                          <h3 className="slider_heading">Wan Lora - Rotate</h3>
                        </div>
                        <div className="slider-tall_img rounded">
                          <img
                            loading="lazy"
                            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif"
                            alt=""
                            sizes="(max-width: 840px) 100vw, 840px"
                            srcSet="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate-p-500.avif 500w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate-p-800.avif 800w, https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6825b0acc901ee5c718efc90_Wan%20Lora%20-%20Rotate.avif 840w"
                            className="slider-tall_photo"
                          />
                          <a
                            href="https://app.weavy.ai/recipe/4IFNep5XnzgCzv84NN4R"
                            target="_blank"
                            className="slider_button w-inline-block"
                          >
                            <div>Try</div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="splide__arrows hide-mobile-landscape">
                  <div className="embed w-embed">
                    <button className="splide__arrow splide__arrow--prev"></button>
                  </div>
                  <div className="embed w-embed">
                    <button className="splide__arrow splide__arrow--next"></button>
                  </div>
                  <div className="hide">
                    <div className="splide__arrow splide__arrow--prev"></div>
                    <div className="splide__arrow splide__arrow--next"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
