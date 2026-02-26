type HelloWorldProps = {
  name?: string;
};

export const HelloWorld = ({ name = "World" }: HelloWorldProps) => {
  return <h1>Hello, {name}!</h1>;
};
