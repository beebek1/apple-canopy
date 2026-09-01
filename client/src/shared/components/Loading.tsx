const styles = `
/* HTML: <div class="loader"></div> */
.loader {
  width: 45px;
  aspect-ratio: 1;
  --c:no-repeat linear-gradient(#000 0 0);
  background: 
    var(--c) 0    0,
    var(--c) 0    100%, 
    var(--c) 50%  50%,   
    var(--c) 100% 0, 
    var(--c) 100% 100%;
  animation: l13 1s infinite alternate;
}

@keyframes l13 {
 0%,10%   {background-size:20% 100%}
 50%      {background-size:20%  20%}
 90%,100% {background-size:100% 20%}
}
`;

function Loading() {
  return (
    <>
      <style>{styles}</style>
      <div className="loader-wrapper">
        <div className="loader" />
      </div>
    </>
  );
}

export default Loading;