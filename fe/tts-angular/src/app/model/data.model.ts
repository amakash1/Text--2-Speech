export interface ISession{
    audioFile: string
    content: string
    duration: number
    sessionId: string
}
export interface IAllSessions{
    sessions : Array<ISession>;
    success:boolean;

}