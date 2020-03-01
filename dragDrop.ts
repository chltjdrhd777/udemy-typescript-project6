//Project Type = to separate the values stored in both activate bar and finishied bar
enum ProjectStatus { // enum is like using an object as a type. If one constant have ProjectStatus type, it's value is restricted into "Active" or "Finished"
  Active,
  Finished
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {
    // parameter "status" should be "Active" or "Finished"
  }
}

//project state management
type Listner = (itmes: Project[]) => void;

class ProjectState {
  //things that would be stored in projects array
  private projects: Project[] = []; //[{id,title,description,people,status}] when intantiated
  private listeners: Listner[] = [];

  //singleton = the blueprint of instances which I would make from now on.
  private static instance: ProjectState; // ProjectState = {projects:[], addProject(title,description,numOfPeople),...}
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  /////////////////////////////////////////////////
  addListener(listenerFn: Listner) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject); // projects: [{id,title,description,people},........]
    for (const listenerFn of this.listeners) {
      // to every function in listners, act with this.projects.slice() <--- this.projects.slice() is the copy of projects array.
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance(); //make one instance.

//validation
interface Validatable {
  value: string | number; // there should be
  required?: boolean; // ?~~ : optional
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true; // default boolean = true
  if (validatableInput.required) {
    // in case that there is "required" property in the object.
    isValid = isValid && validatableInput.value.toString().trim().length !== 0; // new isValid's answer is up to the following condition. if validatableInput.value(is string) is not empty, it is true.
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    // in case that there is "minLength" property in the object + typeguard : validatableInput.value should be string. != null means not null and not undefined to avoid the situation that the minlength is 0
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength; // If validatableInput.value's length is greater than minLength, it returns true
  }

  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid; // about four "if"s which are possible scenarios, retunr true or false.
}

//autobind decorator
function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value; // in method decorator, value contain original method.
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this); // Then, autoBind would attach bind(this) which allows the target method to act in the boundary of the same area it is involved.
      return boundFn;
    }
  };
  return adjDescriptor;
}

//ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];
  constructor(private type: "active" | "finished") {
    //this argument makes private type, and this contain activated or finished. in other words, {type: 'active'} or {type:'finished}
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement; //access to the list template
    this.hostElement = document.getElementById("app")! as HTMLDivElement; // access to the div with id "app". and again, I put "!" because it is not null and "as HTMLDivElement" because it is div element
    this.assignedProjects = [];
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement; // imprtedNode.firstElementChild = in HTML, it is <section>
    this.element.id = `${this.type}-projects`; // In css, I make codes to decorate the boundary of input place. Therefore, I add id into element.

    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list` // Unordered list in the section of project's template
    )! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listEl.appendChild(listItem); // put the <li> inside <ul>
      listItem.textContent = prjItem.title; // and all lists have value "title" in prjItem
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId; //I selected the unlisted order tag in project list template and I put the id which is activated-projects-list or finished-projects-list
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS"; // it would be 'ACTIVE PROJECTS' or 'FINISHIED PROJECTS'
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element); // "beforebegin" <tag>"afterbegin"  "beforeend"</tag> "afterend"
  }
}

//Input section
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement; //access to the input template and save this in templateElement property. "!" mark I put because I know it is not a null
    this.hostElement = document.getElementById("app")! as HTMLDivElement; // access to the div with id "app". and again, I put "!" because it is not null and "as HTMLDivElement" because it is div element

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    ); //importNode() allows me to import all things which exist in another document and value "true" means I want to get the whole contents
    this.element = importedNode.firstElementChild as HTMLFormElement; //firstElementChild allows me to get the fisrt content inside the importedNode. In this case, it is "<form>"
    this.element.id = "user-input"; // In css, I make codes to decorate the boundary of input place. Therefore, I add id into element.

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement; // in constant "element", I can find something which has an ID "title" and populate it in titleInputElement
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach(); // after instanciation of class ProjectInput, the function "attach()" would be run automatically.
  }

  private gatherUserInput(): [string, string, number] | void {
    // it would be working like an input container/ and, the result of this function is to be [string,string,string]
    const enteredTilte = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;
    //In advance, I set the whole values which could be put

    const titleValidatable: Validatable = {
      value: enteredTilte,
      required: true
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5 // the description value should have more than 5 length
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1, // the people value should have more than 1
      max: 5
    };
    if (
      ////////////////////////////////////////////////////////////////////
      //one posible way but has some limitation
      /* enteredTilte.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredPeople.trim().length === 0 */
      //////////////////////////////////////////////////////////////////
      // alternative
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable) //if validate(titleValidatable) is not true or validate(descriptionValidatable) is not true or validate(peopleValidatable) is not true, then
    ) {
      alert("Invalid input, please try again");
      return;
    } else {
      return [enteredTilte, enteredDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  } // after values are sent, they would disappear.

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput(); // in other words, userInput = [enteredTilte,enteredDescription,+enteredPeople]
    if (Array.isArray(userInput)) {
      // Array.isArray('something') = is "something" an array?
      const [title, desc, people] = userInput; // it means that the key names are "title, desc, people" and the value of each key is things in userInput array
      projectState.addProject(title, desc, people); // projects: [{id,title,description,people}]
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler); // if I submit something, submitHandler would get started. But, if I send anything in submitHandler, Then, for it, "this" doesn't mean the class. So, I could add .bind/ but in this case, I would aplly decorator.
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element); // insertAdjacentElement('where' , what). the landmark is hostElement(about where) // Initianlly, I want to get the first content of "importedNode" but it is in a constructor so I made additional route
  }
}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
