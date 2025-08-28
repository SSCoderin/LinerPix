import Provider from "../provider";
export default function ContentLayout({ children }) {
    return <>
        <Provider>
            {children}
        </Provider>
    </>
}