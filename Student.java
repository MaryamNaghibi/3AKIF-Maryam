public class Student
{
    private String name;
    private int alter;
    private boolean mannlich;

    public Student()
    {
        setName("Thomas");
        setAlter(40);
        setMannlich(true);
    }

    public Student(String name, int alter, boolean mannlich)
    {
        setName(name);
        setAlter(alter);
        setMannlich(mannlich);
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public void setAlter(int alter)
    {
        this.alter = alter;
    }

    public void setMannlich(boolean mannlich)
    {
        this.mannlich = mannlich;
    }

    public String getName()
    {
        return name;
    }

    public int getAlter()
    {
        return alter;
    }

    public boolean getMannlich()
    {
        return mannlich;
    }

    public void printStudent()
    {
        System.out.println("Student:\t" + name + "\t" + alter + "\t" + mannlich);
    }
}
