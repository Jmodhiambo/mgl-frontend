// Create a test component that throws error
const BrokenComponent = () => {
  throw new Error('Test error');
  return <div>This won't render</div>;
};

const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <BrokenComponent />
    </div>
  );
};

export default TestPage;