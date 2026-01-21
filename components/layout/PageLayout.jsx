const PageLayout = ({ title, children }) => {
  return (
    <div className="page-container">
      {title && <h1 className="page-title text-center">{title}</h1>}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
