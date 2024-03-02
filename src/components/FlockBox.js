import React from "react";
import './shared/components.css';
// import Draggable from "react-draggable";

// q: what does SOLID mean in object-oriented programming?
// a: SOLID is an acronym for the first five object-oriented design (OOD) principles by Robert C. Martin. The principles are:
//     - Single Responsibility Principle
//     - Open/Closed Principle
//     - Liskov Substitution Principle
//     - Interface Segregation Principle
//     - Dependency Inversion Principle
//   These principles, when combined together, make it easy for a programmer to develop software that is easy to maintain and extend. They also make it easy for developers to avoid code smells, easily refactor code, and are also a part of the agile or adaptive software development.
//   https://www.educba.com/solid-principles-in-java/
//   https://en.wikipedia.org/wiki/SOLID
//   https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/
//   https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/
//   https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/





/* FlockBox component

- surrounds the children elements with a "flock-box" treatment, which currently includes:
    - stylized mini titlebar
    - (maybe in future:) draggable box

expected props:

 */
export default function FlockBox({
          caption = null,
          className = null,
          tooltip = '',
          onKeyDown=null,
          children
      }) {

    return <>

        <div className={`flock-box${className ? ` ${className}` : ''}`}
            onKeyDown={onKeyDown}
            // ref={flockRef}
            >

            <div className={"flock-box-caption"}>{caption}</div>
            <div className={"flock-box-contents"}>{children}</div>

        </div>

    </>
}
